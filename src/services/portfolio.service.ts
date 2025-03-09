import { Portfolio } from "../entities/portfolio.entity";
import { NotFoundError } from "../errors/not-found-error";
import { PortfolioOperationError } from "../errors/portfolio-operation.error";
import DatabaseManager from "./database-manager.service";

class PortfolioService {
    private portflioRepository =
        DatabaseManager.getInstance().appDataSource.getRepository(Portfolio);

    createPortfolio(balance?: number) {
        const portfolio = new Portfolio();
        portfolio.availableBalance = balance || 0;
        portfolio.totalBalance = balance || 0;
        portfolio.reservedBalance = 0;

        return this.portflioRepository.save(portfolio);
    }

    async buyAsset(portfolioId: number, price: number, amount: number) {
        const portfolio = await this.portflioRepository.findOneBy({
            id: portfolioId,
        });

        if (!portfolio) {
            throw new NotFoundError("Portfolio", "Portfolio not found", "id");
        }

        if (portfolio.availableBalance < price * amount) {
            throw new PortfolioOperationError(
                "Insufficient balance to buy asset",
                "BUY",
                amount,
                price
            );
        }

        portfolio.amount += amount;
        portfolio.availableBalance -= price * amount;
        portfolio.reservedBalance += price * amount;

        return this.portflioRepository.save(portfolio);
    }

    async sellAsset(portfolioId: number, price: number, amount: number) {
        const portfolio = await this.portflioRepository.findOneBy({
            id: portfolioId,
        });

        if (!portfolio) {
            throw new NotFoundError("Portfolio", "Portfolio not found", "id");
        }

        if (portfolio.amount < amount) {
            throw new PortfolioOperationError(
                "Insufficient asset amount to sell",
                "SELL",
                amount,
                price
            );
        }

        const portfolioUnitPrice = portfolio.reservedBalance / portfolio.amount;
        const soldValue = portfolioUnitPrice * amount;
        const newReservedBalance = portfolio.reservedBalance - soldValue;
        const newAvailableBalance = portfolio.availableBalance + price * amount;
        portfolio.amount -= amount;
        portfolio.reservedBalance = newReservedBalance;
        portfolio.availableBalance = newAvailableBalance;
        portfolio.totalBalance = newReservedBalance + newAvailableBalance;

        return this.portflioRepository.save(portfolio);
    }

    async addBalance(portfolioId: number, amount: number) {
        const portfolio = await this.portflioRepository.findOneBy({
            id: portfolioId,
        });

        if (!portfolio) {
            throw new NotFoundError("Portfolio", "Portfolio not found", "id");
        }
        portfolio.totalBalance = portfolio.totalBalance + amount;
        portfolio.availableBalance = portfolio.availableBalance + amount;
        portfolio.inputBalance += amount;

        return this.portflioRepository.save(portfolio);
    }
}

export const portfolioService = new PortfolioService();
