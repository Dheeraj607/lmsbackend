import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackagePricing } from './package-pricing.entity';
import { CreatePackagePricingDto } from './dto/create-package-pricing.dto';
import { UpdatePackagePricingDto } from './dto/update-package-pricing.dto';
import { TeacherPackage } from '../teacher-packages/teacher-package.entity';

@Injectable()
export class PackagePricingService {
  constructor(
    @InjectRepository(PackagePricing)
    private readonly repo: Repository<PackagePricing>,
    @InjectRepository(TeacherPackage)
    private readonly packageRepo: Repository<TeacherPackage>,
  ) {}

  async create(dto: CreatePackagePricingDto) {
    const teacherPackage = await this.packageRepo.findOne({ where: { id: dto.packageId } });
    if (!teacherPackage) throw new NotFoundException('Teacher package not found');

    const pricing = this.repo.create({ rate: dto.rate, packageId: dto.packageId });
    return this.repo.save(pricing);
  }

  findAll() {
    return this.repo.find({ relations: ['package'] });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['package'] });
  }

  async update(id: number, dto: UpdatePackagePricingDto) {
    const pricing = await this.repo.findOne({ where: { id } });
    if (!pricing) throw new NotFoundException('Package pricing not found');

    Object.assign(pricing, dto);
    return this.repo.save(pricing);
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Package pricing not found');
    return { message: 'Deleted successfully' };
  }
}
