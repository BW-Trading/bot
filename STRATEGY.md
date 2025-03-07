# Création de stratégie

-   Implémenter la stratégie en créant un nouveau fichier de stratégie dans ./src/strategies

```typescript
export class MyStrategy extends TradingStrategy {
    constructor() {
        super();
    }

    async run(): Promise<void> {
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
