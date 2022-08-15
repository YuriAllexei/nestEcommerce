import { IsArray, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {

    @MinLength(1)
    @IsString()
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsOptional()
    @IsString()
    slug?: string;



    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @IsString({ each: true })
    @IsArray()
    sizes: string[];

    @IsIn(['women', 'kid', 'unisex', 'men'])
    gender: string;

    @IsString()
    @IsOptional()
    description?: string


    @IsString({
        each: true
    })
    @IsArray()
    @IsOptional()
    tags?: string[]


    @IsString({
        each: true
    })
    @IsArray()
    @IsOptional()
    images?: string[]



}
