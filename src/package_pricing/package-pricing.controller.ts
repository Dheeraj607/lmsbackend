import { Controller, Post, Get, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { PackagePricingService } from './package-pricing.service';
import { CreatePackagePricingDto } from './dto/create-package-pricing.dto';
import { UpdatePackagePricingDto } from './dto/update-package-pricing.dto';

@Controller('package-pricing')
export class PackagePricingController {
  constructor(private readonly svc: PackagePricingService) {}

  @Post()
  create(@Body() dto: CreatePackagePricingDto) {
    return this.svc.create(dto);
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePackagePricingDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
