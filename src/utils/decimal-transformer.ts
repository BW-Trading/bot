import { ValueTransformer } from "typeorm";

export const DecimalTransformer: ValueTransformer = {
    to: (value: number | null): string | null =>
        value !== null ? value.toString() : null,
    from: (value: string | null): number | null =>
        value !== null ? parseFloat(value) : null,
};
