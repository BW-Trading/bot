import { MarketAction } from "../entities/market-action.entity";
import DatabaseManager from "./database-manager.service";

class MarketActionService {
    private marketActionRepository =
        DatabaseManager.getInstance().appDataSource.getRepository(MarketAction);

    async save(marketActions: MarketAction[]) {
        return this.marketActionRepository.save(marketActions);
    }
}

export const marketActionService = new MarketActionService();
