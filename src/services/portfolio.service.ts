import { Portfolio } from "../entities/portfolio.entity";
import DatabaseManager from "./database-manager.service";

class PortfolioService {
    private portflioRepository =
        DatabaseManager.getInstance().appDataSource.getRepository(Portfolio);

    createPortfolio(asset: string, balance?: number) {
        const portfolio = new Portfolio();
        portfolio.availableBalance = balance || 0;
        portfolio.totalBalance = balance || 0;
        portfolio.reservedBalance = 0;
        portfolio.asset = asset;

        return this.portflioRepository.save(portfolio);
    }
}

export const portfolioService = new PortfolioService();
