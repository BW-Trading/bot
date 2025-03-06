import { Portfolio } from "../../entities/portfolio.entity";

export function maxBuyableAmount(portfolio: Portfolio, price: number): number {
    const rawAmount = portfolio.availableBalance / price;
    const adjustedAmount = Math.floor(rawAmount * 1e8) / 1e8;
    return adjustedAmount;
}
