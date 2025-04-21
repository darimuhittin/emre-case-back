import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Category } from './categories/entities/category.entity';
import { Province } from './locations/entities/province.entity';
import { District } from './locations/entities/district.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { fakerTR as faker } from '@faker-js/faker';
import { Listing } from './listings/entities/listing.entity';
import { User } from './users/entities/user.entity';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const categoriesRepository = app.get<Repository<Category>>(
    getRepositoryToken(Category),
  );

  const provincesRepository = app.get<Repository<Province>>(
    getRepositoryToken(Province),
  );

  const districtsRepository = app.get<Repository<District>>(
    getRepositoryToken(District),
  );

  const listingsRepository = app.get<Repository<Listing>>(
    getRepositoryToken(Listing),
  );

  const usersRepository = app.get<Repository<User>>(getRepositoryToken(User));

  // Seed categories
  const categories = Array.from({ length: 5 }, () => {
    const name = faker.commerce.department();
    const slug = faker.helpers.slugify(
      name + ' ' + faker.number.int({ min: 1, max: 1000 }),
    );
    return {
      name,
      description: faker.lorem.sentence(),
      slug,
    };
  });

  for (const categoryData of categories) {
    const existingCategory = await categoriesRepository.findOne({
      where: { name: categoryData.name },
    });

    if (!existingCategory) {
      const category = categoriesRepository.create(categoryData);
      await categoriesRepository.save(category);
      console.log(`Created category: ${category.name}`);
    }
  }

  // Seed provinces
  const provinces = Array.from({ length: 5 }, () => {
    const name = faker.address.state();
    const slug = faker.helpers.slugify(
      name + ' ' + faker.number.int({ min: 1, max: 1000 }),
    );
    return {
      name,
      slug,
    };
  });

  for (const provinceData of provinces) {
    const existingProvince = await provincesRepository.findOne({
      where: { name: provinceData.name },
    });

    if (!existingProvince) {
      const province = provincesRepository.create(provinceData);
      await provincesRepository.save(province);
      console.log(`Created province: ${province.name}`);
    }
  }

  // Seed districts
  const allProvinces = await provincesRepository.find({
    relations: ['districts'],
  });
  for (const province of allProvinces) {
    const districts = Array.from({ length: 10 }, () => {
      const name = faker.address.city();
      const slug = faker.helpers.slugify(
        name + ' ' + faker.number.int({ min: 1, max: 1000 }),
      );
      return {
        name,
        slug,
        province,
      };
    });
    for (const districtData of districts) {
      const existingDistrict = await districtsRepository.findOne({
        where: { name: districtData.name },
      });
      if (!existingDistrict) {
        const district = districtsRepository.create(districtData);
        await districtsRepository.save(district);
        console.log(`Created district: ${district.name}`);
      }
    }
  }

  // Seed users
  const users = Array.from({ length: 10 }, () => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }));

  for (const userData of users) {
    const existingUser = await usersRepository.findOne({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const user = usersRepository.create(userData);
      await usersRepository.save(user);
      console.log(`Created user: ${user.name}`);
    }
  }

  const allUsers = await usersRepository.find();
  const allCategories = await categoriesRepository.find();
  const allProvincesFilled = await provincesRepository.find({
    relations: ['districts'],
  });

  // Seed listings
  const listings = Array.from({ length: 980 }, () => {
    console.log('allProvinces : ', allProvincesFilled);
    const province = faker.helpers.arrayElement(allProvincesFilled);
    console.log('province : ', province);
    const district = faker.helpers.arrayElement(province.districts);
    const title = faker.commerce.productName();
    const slug = faker.helpers.slugify(title);

    return {
      title,
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      images: Array.from({ length: 3 }, () =>
        faker.image.url({
          width: 1000,
          height: 1000,
        }),
      ),
      user: faker.helpers.arrayElement(allUsers),
      category: faker.helpers.arrayElement(allCategories),
      province,
      district,
      slug,
    };
  });

  for (const listingData of listings) {
    const existingListing = await listingsRepository.findOne({
      where: { title: listingData.title },
    });

    if (!existingListing) {
      const listing = listingsRepository.create(listingData);
      await listingsRepository.save(listing);
      console.log(`Created listing: ${listing.title}`);
    }
  }

  console.log('Seed completed!');
  await app.close();
}

bootstrap();
