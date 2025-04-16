import { Wallet } from "../entities/wallet.entity";
import { WalletError } from "../errors/wallet.error";
import { DecimalTransformer } from "../utils/decimal-transformer";
import DatabaseManager from "./database-manager.service";

class WalletService {
    walletRepository = DatabaseManager.getAppDataSource().getRepository(Wallet);

    public async createSaveWallet(): Promise<Wallet> {
        const wallet = new Wallet();
        wallet.balance = 0;
        wallet.reservedBalance = 0;
        wallet.placedBalance = 0;

        return await this.walletRepository.save(wallet);
    }

    public createWallet(): Wallet {
        const wallet = new Wallet();
        wallet.balance = 0;
        wallet.reservedBalance = 0;
        wallet.placedBalance = 0;
        return wallet;
    }

    public async getByStrategyIdOrThrow(strategyId: number): Promise<Wallet> {
        const wallet = await this.walletRepository.findOne({
            where: {
                marketDataAccount: {
                    strategies: {
                        id: strategyId,
                    },
                },
            },
        });

        if (!wallet) {
            throw new WalletError("Wallet not found for strategy", {
                strategyId,
            });
        }

        return wallet;
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

        wallet.balance = DecimalTransformer.from(wallet.balance) - amount;
        wallet.reservedBalance =
            DecimalTransformer.from(wallet.reservedBalance) + amount;

        return this.walletRepository.save(wallet);
    }

    public checkBalance(wallet: Wallet, amount: number, quantity: number) {
        // Compute the total amount to check
        const requiredBalance = amount * quantity;

        // Compute estimated fee
        const estimatedFee = 0.001; // Example fee, replace with actual fee calculation
        const totalAmount = requiredBalance + estimatedFee;

        // Check if the wallet has enough balance
        if (wallet.balance < totalAmount) {
            throw new WalletError("Insufficient balance", {
                walletId: wallet.id,
                balance: wallet.balance,
                reservedBalance: wallet.reservedBalance,
                amount,
                quantity,
                estimatedFee,
            });
        }
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

        wallet.reservedBalance =
            DecimalTransformer.from(wallet.reservedBalance) - amount;

        wallet.placedBalance =
            DecimalTransformer.from(wallet.placedBalance) + amount;

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

        wallet.balance = DecimalTransformer.from(wallet.balance) + amount;
        wallet.reservedBalance =
            DecimalTransformer.from(wallet.reservedBalance) - amount;

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

        wallet.balance = DecimalTransformer.from(wallet.balance) + amount;
        wallet.placedBalance =
            DecimalTransformer.from(wallet.placedBalance) - amount;

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

        wallet.balance = DecimalTransformer.from(wallet.balance) - amount;

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
