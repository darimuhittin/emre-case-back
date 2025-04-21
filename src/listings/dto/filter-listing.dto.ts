import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterListingDto {
  @IsOptional()
  @IsString()
  //slug of category
  category?: string;

  @IsOptional()
  @IsString()
  //slug of province
  province?: string;

  @IsOptional()
  @IsString()
  //slug of district
  district?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 12;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
