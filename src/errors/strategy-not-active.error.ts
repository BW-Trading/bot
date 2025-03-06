import { CustomError } from "./custom-error";

export class StrategyNotActiveError extends CustomError {
    constructor(strategyId: number) {
        super("Strategy is not active", 400, "STRATEGY_NOT_ACTIVE", {
            strategyId,
        });
    }
}
