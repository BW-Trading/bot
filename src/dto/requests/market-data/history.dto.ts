import { IsEnum, IsNumberString, IsOptional, IsString } from "class-validator";
import { DTO } from "../../dto";
import { IntervalEnum } from "../../../entities/enums/interval.enum";

export class HistoryDto extends DTO {
    @IsString()
    symbol!: string;

    @IsOptional()
    @IsEnum(IntervalEnum)
    interval: IntervalEnum = IntervalEnum.ONE_DAY;

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
