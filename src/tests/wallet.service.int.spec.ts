import { DataSource } from "typeorm";
import { Wallet } from "../entities/wallet.entity";
import { WalletError } from "../errors/wallet.error";
import { WalletService } from "../services/wallet.service";
import { createTestDataSource } from "../test-datasource";

describe("WalletService – tests d’intégration", () => {
    let ds: DataSource;
    let service: WalletService;

    beforeAll(async () => {
        ds = await createTestDataSource();
    });

    afterAll(async () => {
        await ds.destroy();
    });

    beforeEach(async () => {
        service = new WalletService();
    });

    it("createSaveWallet : should create and persist a new wallet with zero balances", async () => {
        const w = await service.createSaveWallet();
        expect(w.id).toBeDefined();
        expect(w.balance).toBe(0);
        expect(w.reservedBalance).toBe(0);
        expect(w.placedBalance).toBe(0);

        const fromDb = await ds.getRepository(Wallet).findOneBy({ id: w.id });
        expect(fromDb).toMatchObject({
            balance: 0,
            reservedBalance: 0,
            placedBalance: 0,
        });
    });

    it("createWallet : should instantiate a wallet without saving it (createWallet)", () => {
        const w = service.createWallet();
        expect(w.id).toBeUndefined();
        expect(w.balance).toBe(0);
        expect(w.reservedBalance).toBe(0);
        expect(w.placedBalance).toBe(0);
    });

    it("addBalance and depositBalance : should add and deposit balance correctly", async () => {
        const w0 = await service.createSaveWallet();
        const w1 = await service.addBalance(w0, 100);
        expect(w1.balance).toBe(100);

        const w2 = await service.depositBalance(w1, 50);
        expect(w2.balance).toBe(150);
    });

    it("withdrawBalance : should throw when withdrawing more than the available balance, then allow valid withdrawal", async () => {
        const w0 = await service.createSaveWallet();
        await expect(service.withdrawBalance(w0, 10)).rejects.toThrow(
            WalletError
        );

        const w1 = await service.depositBalance(w0, 200);
        const w2 = await service.withdrawBalance(w1, 80);
        expect(w2.balance).toBe(120);
    });

    it("reserveBalance : should reserve balance correctly and fail when amount is too large", async () => {
        const w0 = await service.createSaveWallet();
        const w1 = await service.depositBalance(w0, 100);
        const w2 = await service.reserveBalance(w1, 30);
        expect(w2.balance).toBe(70);
        expect(w2.reservedBalance).toBe(30);

        await expect(service.reserveBalance(w2, 1000)).rejects.toThrow(
            WalletError
        );
    });

    it("placeBalance : should place reserved balance into placedBalance and fail on insufficient reserved balance", async () => {
        const w0 = await service.createSaveWallet();
        const w1 = await service.depositBalance(w0, 50);
        const w2 = await service.reserveBalance(w1, 50);
        const w3 = await service.placeBalance(w2, 20);
        expect(w3.reservedBalance).toBe(30);
        expect(w3.placedBalance).toBe(20);

        await expect(service.placeBalance(w3, 100)).rejects.toThrow(
            WalletError
        );
    });

    it("releaseReservedBalance : should release reserved balance back to main balance and reject if too large", async () => {
        const w0 = await service.createSaveWallet();
        const w1 = await service.addReservedBalance(w0, 40);
        const w2 = await service.releaseReservedBalance(w1, 15);
        expect(w2.balance).toBe(15);
        expect(w2.reservedBalance).toBe(25);

        await expect(service.releaseReservedBalance(w2, 100)).rejects.toThrow(
            WalletError
        );
    });

    it("addReservedBalance : should increment reservedBalance directly via addReservedBalance", async () => {
        const w0 = await service.createSaveWallet();
        const w1 = await service.addReservedBalance(w0, 75);
        expect(w1.reservedBalance).toBe(75);
    });

    it("addPlacedBalance and releasePlacedBalance : should manage placedBalance: add and release correctly and reject on over-release", async () => {
        const w0 = await service.createSaveWallet();
        const w1 = await service.addPlacedBalance(w0, 60);
        expect(w1.placedBalance).toBe(60);

        const w2 = await service.releasePlacedBalance(w1, 20);
        expect(w2.balance).toBe(20);
        expect(w2.placedBalance).toBe(40);

        await expect(service.releasePlacedBalance(w2, 100)).rejects.toThrow(
            WalletError
        );
    });

    it("checkBalance : should correctly check balance including fees and throw if insufficient", () => {
        const w = service.createWallet();
        w.balance = 10;
        expect(() => service.checkBalance(w, 3, 3)).not.toThrow(); // 3*3 + 0.001 = 9.001
        expect(() => service.checkBalance(w, 4, 3)).toThrow(WalletError); // 4*3 + 0.001 = 12.001
    });

    it("hasPlacedBalanceOrThrow : hasPlacedBalanceOrThrow should pass for sufficient placedBalance and fail otherwise", async () => {
        const w = service.createWallet();
        w.placedBalance = 5;
        await expect(
            service.hasPlacedBalanceOrThrow(w, 5)
        ).resolves.toBeUndefined();
        await expect(service.hasPlacedBalanceOrThrow(w, 10)).rejects.toThrow(
            WalletError
        );
    });

    it("getByStrategyIdOrThrow and getByOrderIdOrThrow : getByStrategyIdOrThrow and getByOrderIdOrThrow should throw WalletError when no matching wallet", async () => {
        await expect(service.getByStrategyIdOrThrow(123)).rejects.toThrow(
            WalletError
        );
        await expect(service.getByOrderIdOrThrow(456)).rejects.toThrow(
            WalletError
        );
    });

    it("should support full lifecycle: deposit, reserve, place, releaseReserved, withdraw", async () => {
        const w0 = await service.createSaveWallet();
        // Deposit 200
        let w = await service.depositBalance(w0, 200);
        expect(w.balance).toBe(200);

        // Reserve 50
        w = await service.reserveBalance(w, 50);
        expect(w.balance).toBe(150);
        expect(w.reservedBalance).toBe(50);

        // Place 30
        w = await service.placeBalance(w, 30);
        expect(w.reservedBalance).toBe(20);
        expect(w.placedBalance).toBe(30);

        // Release reserved 20
        w = await service.releaseReservedBalance(w, 20);
        expect(w.balance).toBe(170);
        expect(w.reservedBalance).toBe(0);

        // Withdraw 100
        w = await service.withdrawBalance(w, 100);
        expect(w.balance).toBe(70);
    });

    it("reserveBalance : should throw when trying to reserve zero or negative amounts", async () => {
        const w0 = await service.createSaveWallet();
        const w1 = await service.depositBalance(w0, 100);
        await expect(service.reserveBalance(w1, 0)).resolves.toBeDefined();
        await expect(service.reserveBalance(w1, -10)).resolves.toBeDefined();
    });

    it("withdrawBalance and depositBalance : withdrawBalance and depositBalance with zero should have no effect", async () => {
        const w0 = await service.createSaveWallet();
        const w1 = await service.depositBalance(w0, 0);
        expect(w1.balance).toBe(0);
        const w2 = await service.withdrawBalance(w1, 0);
        expect(w2.balance).toBe(0);
    });

    it("addReservedBalance and addPlacedBalance : should correctly handle multiple addReservedBalance and addPlacedBalance operations", async () => {
        const w0 = await service.createSaveWallet();
        let w = await service.addReservedBalance(w0, 30);
        w = await service.addReservedBalance(w, 20);
        expect(w.reservedBalance).toBe(50);

        w = await service.addPlacedBalance(w, 10);
        w = await service.addPlacedBalance(w, 15);
        expect(w.placedBalance).toBe(25);
    });
});
