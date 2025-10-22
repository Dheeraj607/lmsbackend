import {
  Controller, Post, Get, Param, Put, Delete, Body, UseInterceptors, UploadedFile, ParseIntPipe, HttpException, HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { TeacherPackagesService } from './teacher-packages.service';
import { CreateTeacherPackageDto } from './dto/create-teacher-package.dto';
import { UpdateTeacherPackageDto } from './dto/update-teacher-package.dto';

const storage = diskStorage({
  destination: './uploads', // folder created earlier
  filename: (req, file, cb) => {
    // make filename unique: timestamp + original ext
    const name = `${Date.now()}${extname(file.originalname)}`;
    cb(null, name);
  },
});

@Controller('teacher-packages')
export class TeacherPackagesController {
  constructor(private readonly svc: TeacherPackagesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', { storage }))
  async create(
    @Body() body: CreateTeacherPackageDto,
    @UploadedFile() file?: Express.Multer.File

  ) {
    // file may be undefined if no image uploaded
    const imageName = file ? file.filename : undefined;

   return this.svc.create({ ...body, ...(imageName ? { imageName } : {}) });

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
  @UseInterceptors(FileInterceptor('image', { storage }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTeacherPackageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageName = file ? file.filename : undefined;
    return this.svc.update(id, { ...body, ...(imageName ? { imageName } : {}) });
  }


  @Put(':id/image')
@UseInterceptors(FileInterceptor('image', { storage }))
async updateImage(
  @Param('id', ParseIntPipe) id: number,
  @UploadedFile() file: Express.Multer.File,
) {
  if (!file) {
    throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
  }

  const updated = await this.svc.updateImage(id, file.filename);
  return updated;
}


  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
