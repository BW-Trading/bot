import { IsOptional, IsString } from "class-validator";
import { DTO } from "../dto";

export class MarketHistoryDto extends DTO {
    symbol?: string;

    interval?: string;

    @IsOptional()
    startTime?: number;

    @IsOptional()
    endTime?: number;

    @IsOptional()
    limit?: number;

    @IsOptional()
    @IsString()
    timeZone?: string;
}
