import { IsNumberString, IsString } from "class-validator";
import { DTO } from "../../dto";

export class OrderBookDto extends DTO {
    @IsString()
    symbol!: string;

    @IsNumberString()
    limit?: number;
}
