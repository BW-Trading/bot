import { Wallet } from "../entities/wallet.entity";
import { WalletError } from "../errors/wallet.error";
import DatabaseManager from "./database-manager.service";

class WalletService {
    walletRepository = DatabaseManager.getAppDataSource().getRepository(Wallet);

    public async createWallet(): Promise<Wallet> {
        const wallet = new Wallet();
        wallet.balance = 0;
        wallet.reservedBalance = 0;

        return this.walletRepository.save(wallet);
    }

    /**
     * Reserve balance from the wallet main balance
     */
    public async reserveBalance(
        wallet: Wallet,
        amount: number
    ): Promise<Wallet> {
        if (wallet.balance < amount) {
            throw new WalletError("Insufficient balance", {
                walletId: wallet.id,
                balance: wallet.balance,
                reservedBalance: wallet.reservedBalance,
                amount,
            });
        }

        wallet.balance -= amount;
        wallet.reservedBalance += amount;

        return this.walletRepository.save(wallet);
    }

    /**
     * Place balance from the wallet reserved balance
     */
    public async placeBalance(wallet: Wallet, amount: number): Promise<Wallet> {
        if (wallet.reservedBalance < amount) {
            throw new WalletError("Insufficient reserved balance", {
                walletId: wallet.id,
                balance: wallet.balance,
                reservedBalance: wallet.reservedBalance,
                amount,
            });
        }

        wallet.reservedBalance -= amount;
        wallet.placedBalance += amount;

        return this.walletRepository.save(wallet);
    }

    /**
     * Release reserved balance back to the wallet balance
     */
    public async releaseReservedBalance(
        wallet: Wallet,
        amount: number
    ): Promise<Wallet> {
        if (wallet.reservedBalance < amount) {
            throw new WalletError("Insufficient reserved balance", {
                walletId: wallet.id,
                balance: wallet.balance,
                reservedBalance: wallet.reservedBalance,
                amount,
            });
        }

        wallet.balance += amount;
        wallet.reservedBalance -= amount;

        return this.walletRepository.save(wallet);
    }

    /**
     *
     * Release placed balance back to the wallet balance
     */

    public async releasePlacedBalance(
        wallet: Wallet,
        amount: number
    ): Promise<Wallet> {
        if (wallet.placedBalance < amount) {
            throw new WalletError("Insufficient placed balance", {
                walletId: wallet.id,
                balance: wallet.balance,
                reservedBalance: wallet.reservedBalance,
                placedBalance: wallet.placedBalance,
                amount,
            });
        }

        wallet.balance += amount;
        wallet.placedBalance -= amount;

        return this.walletRepository.save(wallet);
    }

    /**
     * Withdraw balance from the wallet balance
     */
    public async withdrawBalance(
        wallet: Wallet,
        amount: number
    ): Promise<Wallet> {
        if (wallet.balance < amount) {
            throw new WalletError("Insufficient balance to withdraw", {
                walletId: wallet.id,
                balance: wallet.balance,
                reservedBalance: wallet.reservedBalance,
                amount,
            });
        }

        wallet.balance -= amount;

        return this.walletRepository.save(wallet);
    }

    /**
     * Deposit balance to the wallet balance
     */
    public async depositBalance(
        wallet: Wallet,
        amount: number
    ): Promise<Wallet> {
        wallet.balance += amount;

        return this.walletRepository.save(wallet);
    }
}

export const walletService = new WalletService();
