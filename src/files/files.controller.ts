import { Controller, Get, Post, Param, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/fileFilter.helper';
import { fileNamer } from './helpers/fileNamer.helper';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Get('product/:productID')
  async findProductImage(@Res() res: Response, @Param('productID') productID: string) {
    const path = await this.filesService.getStaticProductImage(productID);
    res.sendFile(path);
  }

  @Post("product")
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    //   limits: {
    //     fileSize: 1000
    // }
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.filesService.uploadFile(file);
  }




}
