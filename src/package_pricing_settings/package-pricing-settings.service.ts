import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackagePricingSettings } from './package-pricing-settings.entity';
import { CreatePackagePricingSettingsDto } from './dto/create-package-pricing-settings.dto';
import { UpdatePackagePricingSettingsDto } from './dto/update-package-pricing-settings.dto';
import { PackagePricing } from '../package_pricing/package-pricing.entity';

@Injectable()
export class PackagePricingSettingsService {
  constructor(
    @InjectRepository(PackagePricingSettings)
    private readonly repo: Repository<PackagePricingSettings>,

    @InjectRepository(PackagePricing)
    private readonly pricingRepo: Repository<PackagePricing>,
  ) {}

  async create(dto: CreatePackagePricingSettingsDto) {
    if (dto.discount && dto.specialPrice) {
      throw new BadRequestException('Only one of discount or specialPrice can be set');
    }

    const pricing = await this.pricingRepo.findOne({ where: { id: dto.packagePricingId } });
    if (!pricing) throw new NotFoundException('Package pricing not found');

    const setting = this.repo.create(dto);
    return this.repo.save(setting);
  }

  findAll() {
    return this.repo.find({ relations: ['packagePricing'] });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['packagePricing'] });
  }

  async update(id: number, dto: UpdatePackagePricingSettingsDto) {
    if (dto.discount && dto.specialPrice) {
      throw new BadRequestException('Only one of discount or specialPrice can be set');
    }

    const setting = await this.repo.findOne({ where: { id } });
    if (!setting) throw new NotFoundException('Settings not found');

    Object.assign(setting, dto);
    return this.repo.save(setting);
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Settings not found');
    return { message: 'Deleted successfully' };
  }
}
