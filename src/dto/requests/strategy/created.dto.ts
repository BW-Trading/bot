import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export class CreatedStrategyDto {
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === "true")
    isActive?: boolean;
}
