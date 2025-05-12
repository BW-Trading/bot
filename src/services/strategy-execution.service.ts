import { In } from "typeorm";
import {
    ExecutionStatusEnum,
    StrategyExecution,
} from "../entities/strategy-execution.entity";
import { Strategy } from "../entities/strategy.entity";
import DatabaseManager from "./database-manager.service";

class StrategyExecutionService {
    private strategyExecutionRepository =
        DatabaseManager.getInstance().appDataSource.getRepository(
            StrategyExecution
        );

    async hasActiveExecution(strategyId: number) {
        const execution = await this.strategyExecutionRepository.findOne({
            where: {
                strategy: {
                    id: strategyId,
                },
                status: In([
                    ExecutionStatusEnum.IN_PROGRESS,
                    ExecutionStatusEnum.PENDING,
                ]),
            },

            relations: {
                strategy: true,
            },
        });
        return !!execution;
    }

    async create(strategy: Strategy) {
        const execution = new StrategyExecution();
        execution.status = ExecutionStatusEnum.PENDING;
        execution.strategy = strategy;

        return await this.strategyExecutionRepository.save(execution);
    }

    async start(execution: StrategyExecution, inputData: any) {
        execution.status = ExecutionStatusEnum.IN_PROGRESS;
        execution.startedAt = new Date();

        return await this.strategyExecutionRepository.save(execution);
    }

    async complete(execution: StrategyExecution, resultData: any) {
        execution.status = ExecutionStatusEnum.COMPLETED;
        execution.completedAt = new Date();
        execution.resultData = resultData;

        return await this.strategyExecutionRepository.save(execution);
    }

    async fail(execution: StrategyExecution, errorMessage: string) {
        execution.status = ExecutionStatusEnum.FAILED;
        execution.errorMessage = errorMessage;
        execution.failedAt = new Date();

        return await this.strategyExecutionRepository.save(execution);
    }
}

export const strategyExecutionService = new StrategyExecutionService();
