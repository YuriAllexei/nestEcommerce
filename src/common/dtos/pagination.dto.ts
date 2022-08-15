import { Type } from "class-transformer";
import { IsInt, IsPositive, IsOptional, Min } from "class-validator";

export class PaginationDto {
    @IsInt()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    offset?: number;

    @IsInt()
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    limit?: number;
}