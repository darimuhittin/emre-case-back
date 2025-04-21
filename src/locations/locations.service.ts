import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from './entities/province.entity';
import { District } from './entities/district.entity';
import { ApiResponseMultiple } from '../lib/types/api';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Province)
    private provincesRepository: Repository<Province>,
    @InjectRepository(District)
    private districtsRepository: Repository<District>,
  ) {}

  async findAllProvinces(): Promise<ApiResponseMultiple<Province>> {
    const provinces = await this.provincesRepository.find({
      relations: ['districts'],
    });
    const totalPages = Math.ceil(provinces.length / 10);
    return {
      items: provinces,
      meta: {
        total: provinces.length,
        page: 1,
        limit: 10,
        totalPages,
      },
    };
  }

  async findProvinceById(id: string): Promise<Province> {
    const province = await this.provincesRepository.findOne({
      where: { id },
      relations: ['districts'],
    });
    if (!province) {
      throw new NotFoundException(`Province with ID ${id} not found`);
    }
    return province;
  }

  async findDistrictById(id: string): Promise<District> {
    const district = await this.districtsRepository.findOne({
      where: { id },
      relations: ['province'],
    });
    if (!district) {
      throw new NotFoundException(`District with ID ${id} not found`);
    }
    return district;
  }

  async createProvince(name: string): Promise<Province> {
    const province = this.provincesRepository.create({ name });
    return this.provincesRepository.save(province);
  }

  async createDistrict(name: string, provinceId: string): Promise<District> {
    const province = await this.findProvinceById(provinceId);
    const district = this.districtsRepository.create({
      name,
      province,
    });
    return this.districtsRepository.save(district);
  }

  async updateProvince(id: string, name: string): Promise<Province> {
    const province = await this.findProvinceById(id);
    province.name = name;
    return this.provincesRepository.save(province);
  }

  async updateDistrict(
    id: string,
    name: string,
    provinceId?: string,
  ): Promise<District> {
    const district = await this.findDistrictById(id);
    district.name = name;

    if (provinceId) {
      const province = await this.findProvinceById(provinceId);
      district.province = province;
    }

    return this.districtsRepository.save(district);
  }

  async removeProvince(id: string): Promise<void> {
    const province = await this.findProvinceById(id);
    await this.provincesRepository.remove(province);
  }

  async removeDistrict(id: string): Promise<void> {
    const district = await this.findDistrictById(id);
    await this.districtsRepository.remove(district);
  }
}
