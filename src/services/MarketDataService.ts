import axios from "axios";

export class MarketDataService {
    private baseUrl = "https://api.binance.com/api/v3";

    /**
     * Récupérer le prix moyen pour un symbole
     * Paramètres:
     * - symbol: paire de trading , string , obligatoire
     */
    async getAveragePrice(symbol: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/average-price`, {
                params: { symbol },
            });
            return response.data;
        } catch (error) {
            throw new Error("Erreur lors de la récupération du prix moyen");
        }
    }

    /**
     * Récupérer l'évolution des prix pour un symbole sur 24h
     * Paramètres:
     * - symbol: paire de trading , string , optionnel
     * - symbols: tableau de paires de trading , string , optionnel
     * Peux pas mettre les deux en même temps
     * - type: type de filtre , enum , optionnel , valeurs possibles: "FULL" ou "MINI", default = "FULL"
     */
    async get24hPriceChange(symbol: string, type?: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/ticker/24hr`, {
                params: { symbol, type },
            });
            return response.data;
        } catch (error) {
            throw new Error(
                "Erreur lors de la récupération de l'évolution des prix sur 24h"
            );
        }
    }

    /**
     * Récupérer le prix actuel d'une paire de trading
     * Paramètres:
     * - symbol: paire de trading , string , obligatoire
     * - symbols: tableau de paires de trading , string , optionnel
     * Peux pas mettre les deux en même temps
     */
    async getTickerPrice(symbol: string, symbols?: string[]) {
        try {
            const response = await axios.get(`${this.baseUrl}/ticker/price`, {
                params: { symbol, symbols },
            });
            return response.data;
        } catch (error) {
            throw new Error("Erreur lors de la récupération du prix actuel");
        }
    }

    /**
     * Récupérer les trades récent d'une paire de trading
     * a une limite de 1000 trades
     * Paramètres:
     * - symbol: paire de trading , string , obligatoire
     * - limit: nombre de résultats à retourner , int , optionnel, default = 500 , max = 1000
     */
    async getRecentTrades(symbol: string, limit?: number) {
        try {
            const response = await axios.get(`${this.baseUrl}/trades`, {
                params: { symbol, limit },
            });
            return response.data;
        } catch (error) {
            throw new Error(
                "Erreur lors de la récupération des trades récents"
            );
        }
    }

    /**
     * Récupérer les trades vieux d'une paire de trading à partir d'un certain trade => besoin d'une clé api
     * peut être utilisé pour paginer et éviter de récupérer les mêmes trades
     * Paramètres:
     * - symbol: paire de trading , string , obligatoire
     * - limit: nombre de résultats à retourner , int , optionnel, default = 500 , max = 1000
     * - fromId: id du trade à partir duquel on veut récupérer les trades , int , optionnel , default récupère les trades les plus récents
     */
    async getOldTrades(symbol: string, limit?: number, fromId?: number) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/historicalTrades`,
                {
                    params: { symbol, limit, fromId },
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(
                "Erreur lors de la récupération des trades anciens"
            );
        }
    }

    /**
     * Récupérer les trades compressés et agrégés d'une paire de trading qui ont le même prix, la même heure d'exécution et le même ordre "taker"
     * Paramètres:
     * - symbol: paire de trading , string , obligatoire
     * - fromId: id du trade à partir duquel on veut récupérer les trades agrégés , int , optionnel
     * - startTime: timestamp en millisecondes pour le début de la période à récupérer , int , optionnel
     * - endTime: timestamp en millisecondes pour la fin de la période à récupérer , int , optionnel
     * - limit: nombre de résultats à retourner , int , optionnel, default = 500 , max = 1000
     */
    async getAggregatedTrades(
        symbol: string,
        fromId?: number,
        startTime?: number,
        endTime?: number,
        limit?: number
    ) {
        try {
            const response = await axios.get(`${this.baseUrl}/aggTrades`, {
                params: { symbol, fromId, startTime, endTime, limit },
            });
            return response.data;
        } catch (error) {
            throw new Error(
                "Erreur lors de la récupération des trades agrégés"
            );
        }
    }

    /**
     * Récupérer l'order book d'une paire de trading
     * Paramètres:
     * - symbol: paire de trading , string , obligatoire
     * - limit: nombre de résultats à retourner , int , optionnel, default = 100 , max = 5000
     */
    async getOrderBook(symbol: string, limit?: number) {
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
     * Paramètres:
     * - symbol: paire de trading , string , obligatoire
     * - interval: intervalle de temps , enum , obligatoire , valeurs possibles: 1s, 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
     * - startTime: timestamp en millisecondes pour le début de la période à récupérer , int , optionnel
     * - endTime: timestamp en millisecondes pour la fin de la période à récupérer , int , optionnel (si on ne mets pas les timestamps, on récupère les bougies les plus récentes)
     * - timeZone: timezone , string , optionnel , default = UTC
     * - limit: nombre de résultats à retourner , int , optionnel, default = 500 , max = 1000
     */
    async getMarketHistory(
        symbol: string,
        interval: string,
        limit?: number,
        startTime?: number,
        endTime?: number,
        timeZone?: string
    ) {
        try {
            const response = await axios.get(`${this.baseUrl}/klines`, {
                params: {
                    symbol,
                    interval,
                    limit,
                    startTime,
                    endTime,
                    timeZone,
                },
            });
            return response.data.map((candle: any) => ({
                openTime: candle[0],
                open: candle[1],
                high: candle[2],
                low: candle[3],
                close: candle[4],
                volume: candle[5],
                closeTime: candle[6],
                quoteAssetVolume: candle[7],
                numberOfTrades: candle[8],
                takerBuyBaseAssetVolume: candle[9],
                takerBuyQuoteAssetVolume: candle[10],
                ignore: candle[11],
            }));
        } catch (error) {
            throw new Error(
                "Erreur lors de la récupération de l'historique des prix du marché"
            );
        }
    }

    /**
     * Récupérer l'historique des prix du marché (bougies) adapté pour les graphiques
     * Paramètres:
     * - symbol: paire de trading , string , obligatoire
     * - interval: intervalle de temps , enum , obligatoire , valeurs possibles: 1s, 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
     * - startTime: timestamp en millisecondes pour le début de la période à récupérer , int , optionnel
     * - endTime: timestamp en millisecondes pour la fin de la période à récupérer , int , optionnel (si on ne mets pas les timestamps, on récupère les bougies les plus récentes)
     * - timeZone: timezone , string , optionnel , default = UTC
     * - limit: nombre de résultats à retourner , int , optionnel, default = 500 , max = 1000
     */
    async getMarketHistoryForChart(
        symbol: string,
        interval: string,
        limit?: number,
        startTime?: number,
        endTime?: number,
        timeZone?: string
    ) {
        try {
            const response = await axios.get(`${this.baseUrl}/klines`, {
                params: {
                    symbol,
                    interval,
                    limit,
                    startTime,
                    endTime,
                    timeZone,
                },
            });
            return response.data.map((candle: any) => ({
                openTime: candle[0],
                open: candle[1],
                high: candle[2],
                low: candle[3],
                close: candle[4],
                volume: candle[5],
                closeTime: candle[6],
                quoteAssetVolume: candle[7],
                numberOfTrades: candle[8],
                takerBuyBaseAssetVolume: candle[9],
                takerBuyQuoteAssetVolume: candle[10],
                ignore: candle[11],
            }));
        } catch (error) {
            throw new Error(
                "Erreur lors de la récupération de l'historique des prix du marché"
            );
        }
    }

    /**
     * Récupérer les statistiques des changements de prix pour un jour
     * Paramètres:
     * - symbol: paire de trading , string , obligatoire
     * - symbols: tableau de paires de trading , string , optionnel
     * Peux pas mettre les deux en même temps
     * - type: type de filtre , enum , optionnel , valeurs possibles: "FULL" ou "MINI", default = "FULL"
     * - timeZone: timezone , string , optionnel , default = UTC
     */
    async getDailyPriceChangeStats(
        symbol: string,
        symbols?: string[],
        type?: string,
        timeZone?: string
    ) {
        try {
            const response = await axios.get(`${this.baseUrl}/tradingDay`, {
                params: { symbol, symbols, type, timeZone },
            });
            return response.data;
        } catch (error) {
            throw new Error(
                "Erreur lors de la récupération des statistiques des changements de prix pour un jour"
            );
        }
    }

    /**
     * Récupérer le meilleur prix/quantité sur le carnet d'ordres pour une paire de trading
     * Paramètres:
     * - symbol: paire de trading , string , obligatoire
     * - symbols: tableau de paires de trading , string , optionnel
     * Peux pas mettre les deux en même temps
     **/
    async getBestOrderBook(symbol: string, symbols?: string[]) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/ticker/bookTicker`,
                {
                    params: { symbol, symbols },
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(
                "Erreur lors de la récupération du meilleur prix/quantité sur le carnet d'ordres"
            );
        }
    }
}
