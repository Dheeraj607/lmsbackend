// package-points.controller.ts
import { Controller, Post, Get, Put, Delete, Param, Body, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { PackagePointsService } from './package-points.service';
import { CreatePackagePointDto } from './dto/create-package-point.dto';
import { UpdatePackagePointDto } from './dto/update-package-point.dto';

@Controller('package-points')
export class PackagePointsController {
  constructor(private readonly svc: PackagePointsService) {}

  @Post()
  async create(@Body() dto: CreatePackagePointDto) {
    try {
      // If bulk points provided, call bulk handler
      if (dto.points && Array.isArray(dto.points) && dto.points.length > 0) {
        return await this.svc.createBulk(dto.packageId, dto.points);
      }

      // Otherwise expect single point
      return await this.svc.create({ packageId: dto.packageId, point: dto.point! });
    } catch (err) {
      // surface friendly error
      throw new HttpException(err?.message || 'Internal server error', err?.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePackagePointDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
