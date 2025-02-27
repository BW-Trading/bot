import { IsNumberString, IsOptional, IsString } from "class-validator";
import { DTO } from "../../dto";

export class HistoryDto extends DTO {
    @IsString()
    symbol!: string;

    @IsOptional()
    @IsString()
    interval: string = "1d";

    @IsOptional()
    @IsNumberString()
    limit?: number;

    @IsOptional()
    @IsNumberString()
    startTime?: number;

    @IsOptional()
    @IsNumberString()
    endTime?: number;

    @IsOptional()
    @IsString()
    timeZone?: string;
}
