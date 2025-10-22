// package-points.service.ts
import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackagePoint } from './package-point.entity';
import { CreatePackagePointDto } from './dto/create-package-point.dto';
import { UpdatePackagePointDto } from './dto/update-package-point.dto';
import { TeacherPackage } from '../teacher-packages/teacher-package.entity';

@Injectable()
export class PackagePointsService {
  constructor(
    @InjectRepository(PackagePoint)
    private readonly repo: Repository<PackagePoint>,

    @InjectRepository(TeacherPackage)
    private readonly packageRepo: Repository<TeacherPackage>,
  ) {}

  // single create (keeps existing behavior)
  async create(dto: { packageId: number; point: string }) {
    const teacherPackage = await this.packageRepo.findOne({ where: { id: dto.packageId } });
    if (!teacherPackage) throw new NotFoundException('Teacher package not found');

    const point = this.repo.create({ point: dto.point, packageId: dto.packageId });
    try {
      return await this.repo.save(point);
    } catch (err) {
      console.error('Error saving single point:', err);
      throw new InternalServerErrorException('Could not save package point');
    }
  }

  // bulk create: transactional, safer
  async createBulk(packageId: number, points: string[]) {
    if (!Array.isArray(points) || points.length === 0) {
      throw new BadRequestException('points must be a non-empty array');
    }

    const teacherPackage = await this.packageRepo.findOne({ where: { id: packageId } });
    if (!teacherPackage) throw new NotFoundException('Teacher package not found');

    try {
      const saved = await this.repo.manager.transaction(async (manager) => {
        const entities = points.map((p) => manager.create(PackagePoint, { packageId, point: p }));
        return await manager.save(entities);
      });
      return saved;
    } catch (err) {
      console.error('Error saving bulk points:', err);
      throw new InternalServerErrorException('Could not create package points (bulk)');
    }
  }

  findAll() {
    return this.repo.find({ relations: ['package'] });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['package'] });
  }

  async update(id: number, dto: UpdatePackagePointDto) {
    const point = await this.repo.findOne({ where: { id } });
    if (!point) throw new NotFoundException('Point not found');

    Object.assign(point, dto);
    return this.repo.save(point);
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Point not found');
    return { message: 'Deleted successfully' };
  }
}
