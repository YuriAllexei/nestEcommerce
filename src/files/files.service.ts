import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {


    constructor(private readonly configService: ConfigService) { }

    async getStaticProductImage(productID: string) {
        const path = join(__dirname, '../../static/products', productID);

        if (!existsSync(path)) {
            throw new BadRequestException('No image found');
        }

        return path

    }



    async uploadFile(file: Express.Multer.File) {

        if (!file) return new BadRequestException('No file found')
        return {
            secureUrl: `${this.configService.get('HOST_API')}/files/product/${file.filename}`,
        }

    }
}
