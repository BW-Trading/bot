# TODO

## Fonctionnel

-   Récupération des données via l'API
-   Enregistrer la data de l'API & récupérer les données selon des paramètres

---

-   Bot -> cron task qui va lancer une stratégie en boucle, configurer les stratégies
-   Strategy -> fonction qui va prendre en paramètre les données et retourner une ACTION (achat, vente, rien)
-   Suivi des ACTIONs -> historique des ordres, carnet des actions
-   Exposer les données via une API

class Bot{
strategies: Strategy[]

    run(){
        for(strategy in strategies){
            if(strategy.shouldRun(timeElasped)){
                strategy.run(timeElasped)
            }
        }
    }

}

class MyStrategy extends Strategy{
strategyConfig: StrategyConfig
}

## API

-   Get les data du cours de X

-   Les stratégies
-   Pour chaque stratégies, l'historique des actions

## Historique des actions

-   Action
-   Timestamp
-   Prix

1- Nouvelle execution de la stratégie
2- 