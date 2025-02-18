import axios from "axios";

export class RecupDataService {
    private baseUrl = "https://api.binance.com/api/v3";

    /**
     * Récupérer le prix actuel d'une paire de trading
     */
    async getTickerPrice(symbol: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/ticker/price`, {
                params: { symbol },
            });
            return response.data;
        } catch (error) {
            throw new Error("Erreur lors de la récupération du prix du ticker");
        }
    }

    /**
     * Récupérer l'order book d'une paire de trading
     */
    async getOrderBook(symbol: string, limit: number = 5) {
        try {
            const response = await axios.get(`${this.baseUrl}/depth`, {
                params: { symbol, limit },
            });
            return response.data;
        } catch (error) {
            throw new Error("Erreur lors de la récupération de l'order book");
        }
    }

    /**
     * Récupérer l'historique des prix du marché (bougies)
     */
    async getMarketHistory(symbol: string, interval: string, limit: number) {
        try {
            const response = await axios.get(`${this.baseUrl}/klines`, {
                params: { symbol, interval, limit },
            });

            // Transformer les données brutes en un format plus lisible
            return response.data.map((candle: any) => ({
                openTime: new Date(candle[0]),
                open: parseFloat(candle[1]),
                high: parseFloat(candle[2]),
                low: parseFloat(candle[3]),
                close: parseFloat(candle[4]),
                volume: parseFloat(candle[5]),
                closeTime: new Date(candle[6]),
            }));
        } catch (error) {
            throw new Error(
                "Erreur lors de la récupération de l'historique du marché"
            );
        }
    }
}
