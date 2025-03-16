import { StrategyExecutionStatusEnum } from "../entities/enums/strategy-execution-status.enum";
import { StrategyExecution } from "../entities/strategy-execution.entity";
import { Strategy } from "../entities/strategy.entity";
import { StrategyResult } from "../strategies/trading-strategy.interface";
import DatabaseManager from "./database-manager.service";

class StrategyExecutionService {
    private strategyExecutionRepository =
        DatabaseManager.getInstance().appDataSource.getRepository(
            StrategyExecution
        );

    create(strategy: Strategy) {
        let execution = new StrategyExecution();
        execution.status = StrategyExecutionStatusEnum.PENDING;
        execution.strategy = strategy;
        return this.strategyExecutionRepository.save(execution);
    }

    execute(execution: StrategyExecution) {
        execution.status = StrategyExecutionStatusEnum.EXECUTING;
        return this.strategyExecutionRepository.save(execution);
    }

    complete(execution: StrategyExecution, strategyResult: StrategyResult) {
        execution.status = StrategyExecutionStatusEnum.COMPLETED;
        execution.strategyResult = strategyResult;
        execution.completedAt = new Date();
        return this.strategyExecutionRepository.save(execution);
    }

    fail(execution: StrategyExecution, error: Error) {
        execution.status = StrategyExecutionStatusEnum.FAILED;
        execution.failedAt = new Date();
        execution.error = error.message;
        return this.strategyExecutionRepository.save(execution);
    }
}

export const strategyExecutionService = new StrategyExecutionService();
