import { IsOptional, IsString } from "class-validator";
import { DTO } from "../dto";

export class TickerPriceDto extends DTO {
    @IsOptional()
    @IsString()
    symbol?: string;

    @IsOptional()
    symbols?: string[];
}
