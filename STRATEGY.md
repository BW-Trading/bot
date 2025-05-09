# Principe de fonctionnement d'une strategy

La stratégie retourne un objet "StrategyResult" qui contient notamment des MarketAction à effectuer. Les market actions sont associés à la stratégie active et sont stockés en base de données et peuvent être modifiés à chaque exécution de la stratégie. La stratégie est également responsable de la gestion du porte-feuille de l'utilisateur.
Dans le code de la stratégie, il faut donc bien s'assurer qu'il ya la balance nécessaire avant la création de MarketAction sinon une erreur sera levée.

Imaginons une stratégie simple qui va gérer **un unique** ordre à la fois. La stratégie va acheter si le prix est inférieur à 900 et vendre si le prix est supérieur à 1100.

La fonction run pourrait être implémentée de la manière suivante :

```typescript
async run(): Promise<StrategyResult> {
    const marketPrice = await this.marketService.getTickerPrice();
    const balance = await this.getPortfolio().availableBalance;
    const marketActions = await this.getStrategyOpenMarketActions(); // Recuperer les actions en cours

    if(marketActions.length === 0) { // Si aucune action en cours, on regarde si le prix est inférieur à 900 pour en acheter
        if(marketPrice < 900 && balance >= marketPrice) {
            return {
                marketActions: [
                    await marketActionService.create(this.strategy, 1), // Strategy, quantité (si on voulait utiliser toute la balance disponible, on pourrait faire balance / marketPrice)
                ],
                currentPrice: marketPrice
            }
        }
    } else { // Si une action est en cours, on regarde si le prix est supérieur à 1100 pour la vendre. On peut ensuite modifier l'action en cours pour la mettre à SELL. Le strategy-manager se chargera de la vendre et de mettre à jour le portfolio.
        const marketAction = marketActions[marketActions.length - 1];
        if(marketPrice > 1100) {
            marketAction.action = MarketActionEnum.SELL;
            return {
                marketActions: [
                    marketAction
                ],
                currentPrice: marketPrice
            }
        }
    }
}
```

En conclusion, la stratégie gère sa propres liste d'actions en cours et peut les modifier à chaque exécution. Le strategy-manager se chargera de les executer et de mettre à jour le portfolio.

Les actions fréquemment utilisées entres différentes stratégies pourront être implémentées dans la classe mère TradingStrategy pour éviter de dupliquer du code. (Exemple: getTickerPrice, getPortfolio, getStrategyOpenMarketActions, etc.)

NB: En réalité, une stratégie aussi simple devrait utiliser les champs stopLoss et takeProfit de l'objet MarketAction pour gérer les ordres stop loss et take profit pour une implémentation plus simple.

# Création de stratégie

-   Implémenter la stratégie en créant un nouveau fichier de stratégie dans ./src/strategies

```typescript
export class MyStrategy extends TradingStrategy {
    constructor() {
        super();
    }

    async run(): Promise<StrategyResult> {
        // Code de la stratégie
    }

    validateConfig(config: any): ValidationError[] {
        // Validation de la configuration
    }
}
```

-   Ajouter la stratégie dans ./src/entities/enums/strategies.enum.ts

```typescript
export enum StrategiesEnum {
    TEST = "TEST",
    MOVING_AVERAGE = "MOVING_AVERAGE",
    MY_STRATEGY = "MY_STRATEGY", // Ajouter la stratégie ici
}
```

-   Compléter la méthode 'getStrategyClass' dans ./src/services/strategy.service.ts

```typescript
    getStrategyClass(
        strategy: StrategiesEnum
    ): new (...args: any[]) => ITradingStrategy {
        switch (strategy) {
            case StrategiesEnum.TEST:
                return TestStrategy;
            case StrategiesEnum.MOVING_AVERAGE:
                return MovingAverageStrategy;
            case StrategiesEnum.MY_STRATEGY: // Ajouter la stratégie ici
                return MyStrategy; // Retourner la classe associé à la valeur de l'enum
            default:
                throw new NotFoundError(
                    "Strategy",
                    "Strategy not found",
                    "name"
                );
        }
    }
```
