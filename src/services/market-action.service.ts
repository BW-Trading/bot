import { MarketActionEnum } from "../entities/enums/market-action.enum";
import { MarketAction } from "../entities/market-action.entity";
import DatabaseManager from "./database-manager.service";

class MarketActionService {
    private marketActionRepository =
        DatabaseManager.getInstance().appDataSource.getRepository(MarketAction);

    create(marketActionEnum: MarketActionEnum) {
        const marketAction = new MarketAction();
        marketAction.action = marketActionEnum;
        return this.marketActionRepository.save(marketAction);
    }
}

export const marketActionService = new MarketActionService();
