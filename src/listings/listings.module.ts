import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from './entities/listing.entity';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { CategoriesModule } from '../categories/categories.module';
import { LocationsModule } from '../locations/locations.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Listing]),
        CategoriesModule,
        LocationsModule,
    ],
    providers: [ListingsService],
    controllers: [ListingsController],
    exports: [ListingsService],
})
export class ListingsModule { } 