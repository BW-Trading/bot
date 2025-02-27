import { IsNumberString, IsOptional, IsString } from "class-validator";
import { DTO } from "../../dto";

export class OrderBookDto extends DTO {
    @IsString()
    symbol!: string;

    @IsOptional()
    @IsNumberString()
    limit?: number;
}
