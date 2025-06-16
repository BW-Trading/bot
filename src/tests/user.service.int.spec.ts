// tests/user.service.int.spec.ts
import { DataSource } from "typeorm";
import { User } from "../../src/entities/user.entity";
import { AlreadyExistsError } from "../errors/already-exists.error";
import { NotFoundError } from "../errors/not-found-error";
import { UserService } from "../services/user.service";
import { createTestDataSource } from "../test-datasource";
import DatabaseManager from "../services/database-manager.service";

describe("UserService – tests d’intégration", () => {
    let ds: DataSource;
    let userService: UserService;

    beforeAll(async () => {
        ds = await createTestDataSource();
    });

    afterAll(async () => {
        await ds.destroy();
    });

    beforeEach(async () => {
        userService = new UserService();
    });
    it("should create a new user successfully", async () => {
        const username = "alice";
        const password = "pwd123";
        const salt = "salt";

        const user = await userService.create(username, password, salt);
        expect(user.id).toBeDefined();
        expect(user.username).toBe(username);
        expect(user.password).toBe(password);
        expect(user.salt).toBe(salt);

        const fromDb = await ds.getRepository(User).findOneBy({ id: user.id });
        expect(fromDb).toMatchObject({ username, password, salt });
    });

    it("should throw AlreadyExistsError when creating a user with duplicate username", async () => {
        const username = "bob";
        await userService.create(username, "pass", "salt");
        await expect(
            userService.create(username, "pass2", "salt2")
        ).rejects.toThrow(AlreadyExistsError);
    });

    it("should return true if userExists finds a user", async () => {
        const username = "charlie";
        await userService.create(username, "p", "s");
        const exists = await userService.userExists(username);
        expect(exists).toBe(true);
    });

    it("should return false if userExists finds no user", async () => {
        const exists = await userService.userExists("nonexistent");
        expect(exists).toBe(false);
    });

    it("should find user by username or throw NotFoundError", async () => {
        const username = "david";
        await userService.create(username, "p", "s");
        const found = await userService.findByUsername(username);
        expect(found.username).toBe(username);

        await expect(userService.findByUsername("ghost")).rejects.toThrow(
            NotFoundError
        );
    });

    it("should find user by id or throw NotFoundError", async () => {
        const user = await userService.create("eve", "p", "s");
        const found = await userService.findById(user.id);
        expect(found.id).toBe(user.id);

        await expect(
            userService.findById("00000000-0000-0000-0000-000000000000")
        ).rejects.toThrow(NotFoundError);
    });

    it("should set archived flag correctly", async () => {
        const user = await userService.create("frank", "p", "s");
        // default archived false
        expect(user.archived).toBe(false);
        console.log(" user:", user);
        console.log(" user.id:", user.id);
        const updated = await userService.setArchived(user.id, true);
        expect(updated.archived).toBe(true);
        const reloaded = await userService.findById(user.id);
        expect(reloaded.archived).toBe(true);
    });
});
