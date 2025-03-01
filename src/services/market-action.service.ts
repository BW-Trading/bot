import { MarketActionStatusEnum } from "../entities/enums/market-action-status.enum";
import { MarketAction } from "../entities/market-action.entity";
import DatabaseManager from "./database-manager.service";

class MarketActionService {
    private marketActionRepository =
        DatabaseManager.getInstance().appDataSource.getRepository(MarketAction);

    async save(marketActions: MarketAction[]) {
        return this.marketActionRepository.save(marketActions);
    }

    async fail(marketAction: MarketAction, reason: string) {
        marketAction.status = MarketActionStatusEnum.CANCELLED;
        marketAction.failedAt = new Date();
        marketAction.failedReason = reason;
        return this.marketActionRepository.save(marketAction);
    }

    async executed(marketAction: MarketAction) {
        marketAction.status = MarketActionStatusEnum.EXECUTED;
        return this.marketActionRepository.save(marketAction);
    }
}

export const marketActionService = new MarketActionService();
