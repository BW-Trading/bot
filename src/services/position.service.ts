import { TradeableAssetEnum } from "../entities/enums/tradeable-asset.enum";
import { Position } from "../entities/position.entity";
import { Strategy } from "../entities/strategy.entity";
import DatabaseManager from "./database-manager.service";

class PositionService {
    positionRepository =
        DatabaseManager.getAppDataSource().getRepository(Position);

    async getOrCreatePosition(strategy: Strategy, asset: TradeableAssetEnum) {
        const position = await this.positionRepository.findOneBy({
            strategy: { id: strategy.id },
            asset: asset,
        });

        if (!position) {
            return this.createPosition(strategy, asset);
        }

        return position;
    }

    async createPosition(strategy: Strategy, asset: TradeableAssetEnum) {
        const position = new Position();
        position.strategy = strategy;
        position.asset = asset;

        return this.positionRepository.save(position);
    }
}

export const positionService = new PositionService();
