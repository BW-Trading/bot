import { IsNumberString, IsOptional, IsString } from "class-validator";
import { DTO } from "../dto";

export class MarketHistoryDto extends DTO {
    @IsString()
    symbol!: string;

    @IsString()
    interval!: string;

    @IsOptional()
    @IsNumberString()
    startTime?: number;

    @IsOptional()
    @IsNumberString()
    endTime?: number;

    @IsOptional()
    @IsNumberString()
    limit?: number;

    @IsOptional()
    @IsString()
    timeZone?: string;
}
