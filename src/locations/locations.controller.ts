import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('locations')
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) { }

    @Get('provinces')
    findAllProvinces() {
        return this.locationsService.findAllProvinces();
    }


    @Get('provinces/:id')
    findOneProvince(@Param('id') id: string) {
        return this.locationsService.findProvinceById(id);
    }

    @Get('districts/:id')
    findOneDistrict(@Param('id') id: string) {
        return this.locationsService.findDistrictById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('provinces')
    createProvince(@Body() body: { name: string }) {
        return this.locationsService.createProvince(body.name);
    }

    @UseGuards(JwtAuthGuard)
    @Post('districts')
    createDistrict(@Body() body: { name: string; provinceId: string }) {
        return this.locationsService.createDistrict(body.name, body.provinceId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('provinces/:id')
    updateProvince(@Param('id') id: string, @Body() body: { name: string }) {
        return this.locationsService.updateProvince(id, body.name);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('districts/:id')
    updateDistrict(
        @Param('id') id: string,
        @Body() body: { name: string; provinceId?: string },
    ) {
        return this.locationsService.updateDistrict(id, body.name, body.provinceId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('provinces/:id')
    removeProvince(@Param('id') id: string) {
        return this.locationsService.removeProvince(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('districts/:id')
    removeDistrict(@Param('id') id: string) {
        return this.locationsService.removeDistrict(id);
    }
} 