import { IsNumberString } from "class-validator";

export class ArchiveStrategyDto {
    @IsNumberString()
    id!: number;
}
