import { Portfolio } from "../../entities/portfolio.entity";

/**
 * @param portfolio Portfolio concerné, contenant le solde disponible
 * @param price Prix unitaire d'achat de l'actif
 * @returns Nombre maximal d'unités achetables compte tenu du solde disponible et du prix unitaire.
 * La fonction retourne un nombre arrondi à 8 chiffres après la virgule.
 */
export function maxBuyableAmount(portfolio: Portfolio, price: number): number {
    const rawAmount = portfolio.availableBalance / price;
    const adjustedAmount = Math.floor(rawAmount * 1e8) / 1e8;
    return adjustedAmount;
}
