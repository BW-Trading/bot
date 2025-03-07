import { ValueTransformer } from "typeorm";

/**
 * Transformer typeorm pour la convertion de string en nombre et vice-versa
 */
export const DecimalTransformer: ValueTransformer = {
    to: (value: number | null): string | null =>
        value !== null ? value.toString() : null,
    from: (value: string | null): number | null =>
        value !== null ? parseFloat(value) : null,
};
