import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Province } from './entities/province.entity';
import { District } from './entities/district.entity';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Province, District])],
    providers: [LocationsService],
    controllers: [LocationsController],
    exports: [LocationsService],
})
export class LocationsModule { } 