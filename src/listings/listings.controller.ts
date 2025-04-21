import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { FilterListingDto } from './dto/filter-listing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { User } from '../users/entities/user.entity';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('newImages', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const fileName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, fileName);
        },
      }),
    }),
  )
  @Post()
  create(
    @Body() createListingDto: CreateListingDto,
    @Req() req: Request,
    @UploadedFiles() newImages: Express.Multer.File[],
  ) {
    const user = req.user as { id: string };
    return this.listingsService.create(
      createListingDto,
      {
        id: user.id,
      } as any,
      newImages,
    );
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMyListings(@Query() filterDto: FilterListingDto, @Req() req: Request) {
    const user = req.user as { id: string };
    console.log('USER HERE : ', user);
    return this.listingsService.findAll({
      ...filterDto,
      userId: user.id,
    });
  }

  @Get()
  findAll(@Query() filterDto: FilterListingDto) {
    return this.listingsService.findAll(filterDto);
  }

  @Get('slug/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.listingsService.findOneBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('newImages', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const fileName = `${uuidv4()}${extname(file.originalname)}`;
          console.log('FILE NAME HERE : ', fileName);
          cb(null, fileName);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateListingDto: UpdateListingDto,
    @Req() req: Request,
    @UploadedFiles() newImages: Express.Multer.File[],
  ) {
    console.log('NEW IMAGES HERE : ', newImages);
    const user = req.user as { id: string };
    return this.listingsService.update(
      id,
      updateListingDto,
      user.id,
      newImages,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { id: string };
    return this.listingsService.remove(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/images')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const fileName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, fileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.listingsService.uploadImage(file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/images/:index')
  removeImage(
    @Param('id') id: string,
    @Param('index') index: string,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string };
    return this.listingsService.removeImage(id, parseInt(index, 10), user.id);
  }
}
