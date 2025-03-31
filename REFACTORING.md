# Trading bot entity and classes

## Ameliorations

L'asset n'a pas besoin d'être donné dans un TradeSignal puisque l'asset est déjà dans la stratégie.

validateConfig devrait être utilisé (static function ?) a la création de la stratégie pour checker la validité de la config.

Ajouter une estimation des frais pour valider l'ordre. On reserve la balance après validation