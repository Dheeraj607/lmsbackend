import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherPackage } from './teacher-package.entity';
import { CreateTeacherPackageDto } from './dto/create-teacher-package.dto';
import { UpdateTeacherPackageDto } from './dto/update-teacher-package.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class TeacherPackagesService {
  constructor(
    @InjectRepository(TeacherPackage)
    private readonly repo: Repository<TeacherPackage>,
  ) {}

  create(dto: CreateTeacherPackageDto & { imageName?: string }) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateTeacherPackageDto & { imageName?: string }) {
    await this.repo.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.repo.delete(id);
  }

  // -------------------------
  // New method to update image
  // -------------------------
  async updateImage(id: number, newImageName: string) {
    const pkg = await this.repo.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Teacher package not found');

    // Delete old image if exists
    if (pkg.imageName) {
      try {
        const oldPath = join(process.cwd(), 'uploads', pkg.imageName);
        await unlink(oldPath).catch((e) => {
          if ((e as any).code !== 'ENOENT') console.warn('Error deleting old image:', e);
        });
      } catch (err) {
        console.warn('Unexpected error deleting old image:', err);
      }
    }

    // Update with new image
    pkg.imageName = newImageName;
    return this.repo.save(pkg);
  }
}
