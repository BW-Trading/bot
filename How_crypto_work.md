## Résumé
Sur Binance, tu peux acheter et vendre des cryptos de plusieurs manières. Voici les principales options :
### Le marché Spot (Achat/Vente immédiate)
Tu achètes ou vends directement une crypto à son prix actuel.
Exemple : Acheter 1 BTC à 48 000 USDT.
### Le marché Futures (Contrats dérivés)
Tu peux spéculer sur la hausse ou la baisse d'une crypto sans la posséder réellement.
Utilisation de l'effet de levier.
### Les ordres sur Binance
- Market Order : Achat/Vente immédiate au prix du marché.
- Limit Order : Achat/Vente à un prix fixé par toi.
- Stop-Limit Order : Exécution d’un ordre lorsqu’un prix défini est atteint.
- OCO (One Cancels the Other) : Deux ordres placés en même temps, l'un annulant l'autre.

Les achats et ventes se sont pour des paires (crypto/monnaie)

exemple d'achat avec l'API Binance :
```bash
const order = await client.order({
    symbol: 'ETHUSDT',
    side: 'BUY',
    type: 'MARKET',
    quantity: 1,
  });
```

## Order Book
L'order book (ou carnet d'ordres) est un registre en temps réel qui affiche la liste des ordres d'achat et de vente placés sur un marché pour une paire de trading spécifique (ex: BTC/USDT).

Il permet de voir qui veut acheter, qui veut vendre, à quel prix et en quelle quantité.

Ce sont les ordres en attente d'éxécution donc dès qu'un nouvel ordre est placé ou qu'un ordre existant est annulé, l'order book est mis à jour.

### Structure d'un Order Book
L'order book est composé de deux parties principales :
- Les ordres d'achat ("Bids") → Ce sont les acheteurs qui placent des offres d'achat à un prix donné.
Prix le plus élevé = "Best Bid" (le meilleur prix auquel quelqu’un veut acheter).
Les acheteurs veulent payer le moins cher possible.

- Les ordres de vente ("Asks") → Ce sont les vendeurs qui placent des offres de vente.
Prix le plus bas = "Best Ask" (le meilleur prix auquel quelqu’un veut vendre).
Les vendeurs veulent vendre au prix le plus haut possible.

La différence entre le meilleur prix d’achat et de vente s’appelle le “spread”.

### À quoi sert l'Order Book ?
L'order book est essentiel pour les traders car il donne des indications sur l'offre et la demande en temps réel. Il permet de :

- Évaluer la liquidité 

Si l’order book est rempli avec de nombreux ordres à différents prix, cela signifie qu’il y a beaucoup de liquidité.
Une faible liquidité entraîne des écarts de prix plus grands (spread élevé).

- Identifier les niveaux de support et de résistance 

S’il y a beaucoup d’ordres d’achat à un prix donné, ce niveau peut être un support (les acheteurs protègent ce prix).
S’il y a beaucoup d’ordres de vente, ce niveau peut être une résistance (les vendeurs défendent ce prix).

- Anticiper les mouvements de prix 

Si des gros ordres d’achat apparaissent → possible hausse.
Si des gros ordres de vente apparaissent → possible baisse.

- Exécuter une stratégie de trading efficace 

Les traders utilisent l’order book pour passer des ordres au bon moment et au bon prix.

## Bougie
### Structure d'une bougie
Une bougie représente quatre prix sur une période donnée (ex: 1 minute, 1 heure, 1 jour) :
- Prix d'ouverture (open) → Le prix de l'actif au début de la période.
- Prix de clôture (close) → Le prix de l'actif à la fin de la période.
- Prix le plus haut (high) → Le prix le plus élevé atteint durant la période.
- Prix le plus bas (low) → Le prix le plus bas atteint durant la période.
Elle contient aussi le volume des transactions réalisées pendant cette période.

### Représentation visuelle
Une bougie est composée de deux parties principales :
- Le corps → Représente la différence entre le prix d'ouverture et de clôture.
Si le prix monte (clôture > ouverture) → Bougie verte (haussière).
Si le prix descend (clôture < ouverture) → Bougie rouge (baissière).

- Les mèches (ou ombres) → Indiquent les prix extrêmes atteints pendant la période :
Mèche haute : Le prix le plus haut atteint.
Mèche basse : Le prix le plus bas atteint.

