// tests/user.service.int.spec.ts
import { DataSource } from "typeorm";
import { User } from "../../src/entities/user.entity";
import { AlreadyExistsError } from "../errors/already-exists.error";
import { NotFoundError } from "../errors/not-found-error";
import { UserService } from "../services/user.service";
import { createTestDataSource } from "../test-datasource";

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
    it("create : should create a new user successfully", async () => {
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

    it("create : should throw AlreadyExistsError when creating a user with duplicate username", async () => {
        const username = "bob";
        await userService.create(username, "pass", "salt");
        await expect(
            userService.create(username, "pass2", "salt2")
        ).rejects.toThrow(AlreadyExistsError);
    });

    it("userExists : should return true if userExists finds a user", async () => {
        const username = "charlie";
        await userService.create(username, "p", "s");
        const exists = await userService.userExists(username);
        expect(exists).toBe(true);
    });

    it("userExists : should return false if userExists finds no user", async () => {
        const exists = await userService.userExists("nonexistent");
        expect(exists).toBe(false);
    });

    it("findByUsername : should find user by username or throw NotFoundError", async () => {
        const username = "david";
        await userService.create(username, "p", "s");
        const found = await userService.findByUsername(username);
        expect(found.username).toBe(username);

        await expect(userService.findByUsername("ghost")).rejects.toThrow(
            NotFoundError
        );
    });

    it("findById : should find user by id or throw NotFoundError", async () => {
        const user = await userService.create("eve", "p", "s");
        const found = await userService.findById(user.id);
        expect(found.id).toBe(user.id);

        await expect(
            userService.findById("00000000-0000-0000-0000-000000000000")
        ).rejects.toThrow(NotFoundError);
    });

    it("setArchived : should set archived flag correctly", async () => {
        const user = await userService.create("frank", "p", "s");
        expect(user.archived).toBe(false);
        const updated = await userService.setArchived(user.id, true);
        expect(updated.archived).toBe(true);
        const reloaded = await userService.findById(user.id);
        expect(reloaded.archived).toBe(true);
    });
    it("setArchived : should unarchive a previously archived user", async () => {
        const user = await userService.create("george", "p", "s");
        await userService.setArchived(user.id, true);
        const unarchived = await userService.setArchived(user.id, false);
        expect(unarchived.archived).toBe(false);
    });

    it("setArchived : setArchived should throw NotFoundError for non-existent user id", async () => {
        await expect(
            userService.setArchived(
                "00000000-0000-0000-0000-000000000000",
                true
            )
        ).rejects.toThrow(NotFoundError);
    });

    it("userExists : userExists should return true for archived users", async () => {
        const username = "henry";
        const user = await userService.create(username, "p", "s");
        await userService.setArchived(user.id, true);
        const exists = await userService.userExists(username);
        expect(exists).toBe(true);
    });
});
