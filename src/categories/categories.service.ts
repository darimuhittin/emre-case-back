import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { ApiResponseMultiple } from '../lib/types/api';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<ApiResponseMultiple<Category>> {
    const categories = await this.categoriesRepository.find();
    return {
      items: categories,
      meta: {
        total: categories.length,
        page: 1,
        limit: categories.length,
        totalPages: 1,
      },
    };
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(name: string, description?: string): Promise<Category> {
    const category = this.categoriesRepository.create({ name, description });
    return this.categoriesRepository.save(category);
  }

  async update(
    id: string,
    name?: string,
    description?: string,
  ): Promise<Category> {
    const category = await this.findById(id);

    if (name) {
      category.name = name;
    }

    if (description !== undefined) {
      category.description = description;
    }

    return this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findById(id);
    await this.categoriesRepository.remove(category);
  }
}
