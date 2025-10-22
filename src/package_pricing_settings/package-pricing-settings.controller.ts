import { Controller, Post, Get, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { PackagePricingSettingsService } from './package-pricing-settings.service';
import { CreatePackagePricingSettingsDto } from './dto/create-package-pricing-settings.dto';
import { UpdatePackagePricingSettingsDto } from './dto/update-package-pricing-settings.dto';

@Controller('package-pricing-settings')
export class PackagePricingSettingsController {
  constructor(private readonly svc: PackagePricingSettingsService) {}

  @Post()
  create(@Body() dto: CreatePackagePricingSettingsDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePackagePricingSettingsDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
