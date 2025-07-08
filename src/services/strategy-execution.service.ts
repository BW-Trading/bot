import { In } from "typeorm";
import {
    ExecutionStatusEnum,
    StrategyExecution,
} from "../entities/strategy-execution.entity";
import { Strategy } from "../entities/strategy.entity";
import DatabaseManager from "./database-manager.service";

export class StrategyExecutionService {
    private getRepository() {
        const dataSource = DatabaseManager.getAppDataSource();
        if (!dataSource.isInitialized) {
            throw new Error("DataSource is not initialized yet");
        }
        return dataSource.getRepository(StrategyExecution);
    }
    async hasActiveExecution(strategyId: number) {
        const strategyExecutionRepository = this.getRepository();

        const execution = await strategyExecutionRepository.findOne({
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
        const strategyExecutionRepository = this.getRepository();

        return await strategyExecutionRepository.save(execution);
    }

    async start(execution: StrategyExecution, inputData: any) {
        execution.status = ExecutionStatusEnum.IN_PROGRESS;
        execution.startedAt = new Date();
        const strategyExecutionRepository = this.getRepository();

        return await strategyExecutionRepository.save(execution);
    }

    async complete(execution: StrategyExecution, resultData: any) {
        execution.status = ExecutionStatusEnum.COMPLETED;
        execution.completedAt = new Date();
        execution.resultData = resultData;
        const strategyExecutionRepository = this.getRepository();

        return await strategyExecutionRepository.save(execution);
    }

    async fail(execution: StrategyExecution, errorMessage: string) {
        execution.status = ExecutionStatusEnum.FAILED;
        execution.errorMessage = errorMessage;
        execution.failedAt = new Date();
        const strategyExecutionRepository = this.getRepository();

        return await strategyExecutionRepository.save(execution);
    }
}

export const strategyExecutionService = new StrategyExecutionService();
