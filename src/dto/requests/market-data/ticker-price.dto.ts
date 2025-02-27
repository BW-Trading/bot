import { IsOptional, IsString } from "class-validator";
import { DTO } from "../../dto";

export class TickerPriceDto extends DTO {
    @IsString()
    symbol!: string;

    @IsOptional()
    @IsString({ each: true })
    symbols?: string[];
}
