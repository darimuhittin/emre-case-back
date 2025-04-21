import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike, Equal, Or } from 'typeorm';
import { Listing } from './entities/listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { FilterListingDto } from './dto/filter-listing.dto';
import { CategoriesService } from '../categories/categories.service';
import { LocationsService } from '../locations/locations.service';
import { User } from '../users/entities/user.entity';
import { ApiResponseMultiple } from '../lib/types/api';
import { faker } from '@faker-js/faker';
import { unlink, existsSync } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
    private categoriesService: CategoriesService,
    private locationsService: LocationsService,
  ) { }

  async create(
    createListingDto: CreateListingDto,
    user: User,
    newImages: Express.Multer.File[],
  ): Promise<Listing> {
    const category = await this.categoriesService.findById(
      createListingDto.categoryId,
    );
    const district = await this.locationsService.findDistrictById(
      createListingDto.districtId,
    );

    let slug = faker.helpers.slugify(createListingDto.title);

    let existingListing = await this.listingsRepository.findOne({
      where: { slug },
    });

    while (existingListing) {
      slug = faker.helpers.slugify(
        `${createListingDto.title}-${Math.random().toString(36).substring(2, 15)}`,
      );
      existingListing = await this.listingsRepository.findOne({
        where: { slug },
      });
    }

    const listing = this.listingsRepository.create({
      ...createListingDto,
      user,
      category,
      district,
      slug,
      images: newImages?.map((image) => `real:${image.filename}`),
    });

    return this.listingsRepository.save(listing);
  }

  async findOneBySlug(slug: string): Promise<Listing> {
    return this.listingsRepository.findOne({
      where: { slug },
      relations: ['user', 'category', 'district', 'district.province'],
    });
  }

  async findAll(
    filterDto: FilterListingDto,
  ): Promise<ApiResponseMultiple<Listing>> {
    const { category, province, district, search, page, limit, userId } =
      filterDto;
    const skip = (page - 1) * limit;

    let where: FindOptionsWhere<Listing>[] | FindOptionsWhere<Listing> = [];
    let singleWhere: FindOptionsWhere<Listing> = {};

    if (category) {
      console.log('CATEGORY HERE : ', category);
      singleWhere.category = { slug: category };
    }

    if (district) {
      console.log('DISTRICT HERE : ', district);
      singleWhere.district = { slug: district };
    }

    if (province) {
      console.log('PROVINCE HERE : ', province);
      singleWhere.district = { province: { slug: province } };
    }

    if (userId) {
      console.log('USER ID HERE : ', userId);
      singleWhere.userId = Equal(userId);
    }

    if (search) {
      console.log('SEARCH HERE : ', search);
      where.push({
        title: ILike(`%${search}%`),
        ...singleWhere,
      });
      where.push({
        description: ILike(`%${search}%`),
        ...singleWhere,
      });
      where.push({
        price: Number(search),
        ...singleWhere,
      });
    } else {
      where.push(singleWhere);
    }

    const [items, total] = await this.listingsRepository.findAndCount({
      where: where,
      relations: ['user', 'category', 'district', 'district.province'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<Listing> {
    const listing = await this.listingsRepository.findOne({
      where: { id },
      relations: ['user', 'category', 'district', 'district.province'],
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    return listing;
  }

  async update(
    id: string,
    updateListingDto: UpdateListingDto,
    userId: string,
    files: Express.Multer.File[],
  ): Promise<Listing> {
    const listing = await this.findOne(id);

    if (listing.user.id !== userId) {
      throw new BadRequestException('You can only update your own listings');
    }

    if (updateListingDto.categoryId) {
      const category = await this.categoriesService.findById(
        updateListingDto.categoryId,
      );
      listing.category = category;
    }

    if (updateListingDto.districtId) {
      const district = await this.locationsService.findDistrictById(
        updateListingDto.districtId,
      );
      listing.district = district;
    }
    let newImages = [...listing.images];
    if (files) {
      const newUrls = files.map((file) => `real:${file.filename}`);
      newImages = [...newImages, ...newUrls];
    }

    if (updateListingDto.imagesToDelete) {
      const imagesToDelete = updateListingDto.imagesToDelete.split(',');
      for (const image of imagesToDelete) {
        const imagePath = path.join(__dirname, '..', '..', 'uploads', image);
        if (existsSync(imagePath)) {
          unlink(imagePath, (err) => {
            if (err) {
              console.error('Error deleting image : ', err);
            }
          });
        }
      }
      console.log('delete images : ', updateListingDto.imagesToDelete.split(','));
      newImages = newImages.filter(
        (image) => !updateListingDto.imagesToDelete.split(',').includes(image),
      );
    }

    listing.images = newImages;

    return this.listingsRepository.save(listing);
  }

  async remove(id: string, userId: string): Promise<void> {
    const listing = await this.findOne(id);

    if (listing.user.id !== userId) {
      throw new BadRequestException('You can only delete your own listings');
    }

    await this.listingsRepository.remove(listing);
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const imageUrl = `${file.filename}-${uuidv4()}`;
    //upload to uploads folder
    const uploadPath = path.join(__dirname, '..', '..', 'uploads', imageUrl);
    await fs.promises.writeFile(uploadPath, file.buffer);

    return `real:${imageUrl}`;
  }

  async removeImage(
    id: string,
    imageIndex: number,
    userId: string,
  ): Promise<Listing> {
    const listing = await this.findOne(id);

    if (listing.user.id !== userId) {
      throw new BadRequestException(
        'You can only remove images from your own listings',
      );
    }

    if (imageIndex < 0 || imageIndex >= listing.images.length) {
      throw new BadRequestException('Invalid image index');
    }

    listing.images.splice(imageIndex, 1);

    return this.listingsRepository.save(listing);
  }
}
