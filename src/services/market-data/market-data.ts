export abstract class MarketDataService {
    abstract availableMarketData: string[];

    hasMarketData(marketData: string): boolean {
        return this.availableMarketData.includes(marketData);
    }

    abstract retrieveMarketData(requiredMarketData: string[]): Promise<any>;
}
