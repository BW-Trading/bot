import { VarEnvValidationError } from "../../errors/var-env-validation.error";
import { EnvVarType, validateEnvVariable } from "./validate-env-variable";

/*
 * This file is responsible for loading and validating environment variables from the .env file.
 * It must not use the logger as the logger uses the environment variables. (circular dependency)
 */

require("dotenv").config();

export const getEnvVariable = <T>(key: string, type: EnvVarType): T => {
    const value = process.env[key];

    if (!value) {
        console.error(`Environment variable ${key} is required`);
        process.exit(1);
    }

    let validated;
    try {
        validated = validateEnvVariable<T>(value, type, key);
    } catch (error) {
        if (error instanceof VarEnvValidationError) {
            console.error(
                `Error validating environment variable ${key}: ${error.toLogObject()}`
            );
            process.exit(1);
        }
    }

    if (validated === undefined) {
        console.error(`Error validating environment variable ${key}`);
        process.exit(1);
    }

    return validated;
};

export const getOptionalEnvVariable = <T>(
    key: string,
    type: EnvVarType
): T | undefined => {
    const value = process.env[key];

    if (!value) {
        console.warn(`Optionnal environment variable ${key} is not set.`);
        return undefined;
    }

    let validated;
    try {
        validated = validateEnvVariable<T>(value, type, key);
    } catch (error) {
        if (error instanceof VarEnvValidationError) {
            console.warn(
                `Validating optionnal environment variable failed ${key}: ${error.message}`
            );
        }
        return undefined;
    }

    if (validated === undefined) {
        console.warn(`Validating optionnal environment variable failed ${key}`);
        return undefined;
    }

    return validated;
};
