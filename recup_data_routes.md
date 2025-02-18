# API - Récupération de données Binance

Cette API permet de récupérer diverses informations sur les paires de trading de Binance, telles que le prix actuel, l'order book, et l'historique des prix sous forme de bougies.

## 1. **Récupérer le prix actuel d'une paire de trading**
Cette route permet de récupérer le prix actuel (ticker price) d'une paire de trading spécifiée.

### **URL**
GET /api/recup_data/ticker_price

### **Paramètres**
- `symbol` : Le symbole de la paire de trading (ex : `BTCUSDT`, `ETHUSDT`, etc.).

### **Exemple d'appel :**
GET /api/recup_data/ticker_price?symbol=BTCUSDT

### **Réponse**
La réponse contient le prix actuel de la paire spécifiée.
```json
{
    "data": {
        "symbol": "BTCUSDT",
        "price": "94982.00000000"
    },
    "message": "Ticker price retrieved successfully",
    "success": true,
    "code": 200
}
```
## 2. **Récupérer l'order book d'une paire de trading**
Cette route permet de récupérer l'order book d'une paire de trading spécifiée. L'order book contient les dernières commandes d'achat (bids) et de vente (asks).

### **URL**
GET /api/recup_data/order_book

### **Paramètres**
- `symbol` : Le symbole de la paire de trading (ex : `BTCUSDT`, `ETHUSDT`, etc.).
- `limit` : Le nombre de lignes à retourner (par défaut : 5).

### **Exemple d'appel :**
GET /api/recup_data/order_book?symbol=BTCUSDT&limit=5

### **Réponse**
La réponse contient les dernières commandes d'achat et de vente de la paire spécifiée.
```json
{
    "data": {
        "lastUpdateId": 61319762119,
        "bids": [
            [
                "94999.81000000",
                "4.72638000"
            ],
            [
                "94999.69000000",
                "0.00024000"
            ],
            [
                "94999.68000000",
                "0.71396000"
            ],
            [
                "94999.67000000",
                "0.00012000"
            ],
            [
                "94999.66000000",
                "0.00012000"
            ]
        ],
        "asks": [
            [
                "94999.82000000",
                "0.84462000"
            ],
            [
                "94999.83000000",
                "0.00006000"
            ],
            [
                "94999.84000000",
                "0.00006000"
            ],
            [
                "95000.00000000",
                "0.00029000"
            ],
            [
                "95000.37000000",
                "0.00006000"
            ]
        ]
    },
    "message": "Order book retrieved successfully",
    "success": true,
    "code": 200
}
```

## 3. **Récupérer l'historique des prix sous forme de bougies**
Cette route permet de récupérer l'historique des prix d'une paire de trading sous forme de bougies (candlesticks).
Chaque bougie contient les prix d'ouverture, de fermeture, de plus haut et de plus bas sur une période de temps donnée.

### **URL**
GET /api/recup_data/market_history

### **Paramètres**
- `symbol` : Le symbole de la paire de trading (ex : `BTCUSDT`, `ETHUSDT`, etc.).
- `interval` : L'intervalle de temps des bougies (ex : `1m`, `5m`, `1h`, `1d`, etc.). par défaut : `1d`.
- `limit` : Le nombre de bougies à retourner (par défaut : 100).

### **Exemple d'appel :**
GET /api/recup_data/market_history?symbol=BTCUSDT&interval=1h&limit=5

### **Réponse**
La réponse contient l'historique des prix de la paire spécifiée sous forme de bougies.
```json
{
    "data": [
        {
            "openTime": "2025-02-18T18:00:00.000Z",
            "open": 94102.16,
            "high": 94350.87,
            "low": 93600,
            "close": 93924.03,
            "volume": 1837.49675,
            "closeTime": "2025-02-18T18:59:59.999Z"
        },
        {
            "openTime": "2025-02-18T19:00:00.000Z",
            "open": 93924.03,
            "high": 94403.88,
            "low": 93388.09,
            "close": 94104.14,
            "volume": 1415.12054,
            "closeTime": "2025-02-18T19:59:59.999Z"
        },
        {
            "openTime": "2025-02-18T20:00:00.000Z",
            "open": 94104.15,
            "high": 94458.4,
            "low": 93730.72,
            "close": 94196.02,
            "volume": 1086.1389,
            "closeTime": "2025-02-18T20:59:59.999Z"
        },
        {
            "openTime": "2025-02-18T21:00:00.000Z",
            "open": 94196.77,
            "high": 95351.4,
            "low": 94118.8,
            "close": 95065.46,
            "volume": 1602.56826,
            "closeTime": "2025-02-18T21:59:59.999Z"
        },
        {
            "openTime": "2025-02-18T22:00:00.000Z",
            "open": 95065.46,
            "high": 95094.73,
            "low": 94953.66,
            "close": 94991.35,
            "volume": 215.54689,
            "closeTime": "2025-02-18T22:59:59.999Z"
        }
    ],
    "message": "Market history retrieved successfully",
    "success": true,
    "code": 200
}
```



