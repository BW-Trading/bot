import { DataSource } from "typeorm";
import { User } from "../../src/entities/user.entity";
import { AlreadyExistsError } from "../errors/already-exists.error";
import { NotFoundError } from "../errors/not-found-error";
import { UserService } from "../services/user.service";
import { createTestDataSource } from "../test-datasource";

describe("UserService (integration)", () => {
    let dataSource: DataSource;
    let userService: UserService;

    beforeAll(async () => {
        dataSource = await createTestDataSource();
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(() => {
        userService = new UserService();
    });

    describe("create", () => {
        it("should create a new user successfully", async () => {
            const username = "alice";
            const password = "pwd123";
            const salt = "salt";

            const user = await userService.create(username, password, salt);
            expect(user.id).toBeDefined();
            expect(user.username).toBe(username);
            expect(user.password).toBe(password);
            expect(user.salt).toBe(salt);

            const fromDb = await dataSource
                .getRepository(User)
                .findOneBy({ id: user.id });
            expect(fromDb).toMatchObject({ username, password, salt });
        });

        it("should throw AlreadyExistsError when username already exists", async () => {
            const username = "bob";
            await userService.create(username, "pass", "salt");
            await expect(
                userService.create(username, "pass2", "salt2")
            ).rejects.toThrow(AlreadyExistsError);
        });
    });

    describe("userExists", () => {
        it("should return true if user exists", async () => {
            const username = "charlie";
            await userService.create(username, "p", "s");
            const exists = await userService.userExists(username);
            expect(exists).toBe(true);
        });

        it("should return false if user does not exist", async () => {
            const exists = await userService.userExists("nonexistent");
            expect(exists).toBe(false);
        });

        it("should return true for archived users", async () => {
            const username = "henry";
            const user = await userService.create(username, "p", "s");
            await userService.setArchived(user.id, true);
            const exists = await userService.userExists(username);
            expect(exists).toBe(true);
        });
    });

    describe("findByUsername", () => {
        it("should find user by username", async () => {
            const username = "david";
            await userService.create(username, "p", "s");
            const found = await userService.findByUsername(username);
            expect(found.username).toBe(username);
        });

        it("should throw NotFoundError if user does not exist", async () => {
            await expect(userService.findByUsername("ghost")).rejects.toThrow(
                NotFoundError
            );
        });
    });

    describe("findById", () => {
        it("should find user by id", async () => {
            const user = await userService.create("eve", "p", "s");
            const found = await userService.findById(user.id);
            expect(found.id).toBe(user.id);
        });

        it("should throw NotFoundError if user id does not exist", async () => {
            await expect(
                userService.findById("00000000-0000-0000-0000-000000000000")
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe("setArchived", () => {
        it("should archive a user", async () => {
            const user = await userService.create("frank", "p", "s");
            expect(user.archived).toBe(false);
            const updated = await userService.setArchived(user.id, true);
            expect(updated.archived).toBe(true);
            const reloaded = await userService.findById(user.id);
            expect(reloaded.archived).toBe(true);
        });

        it("should unarchive a user", async () => {
            const user = await userService.create("george", "p", "s");
            await userService.setArchived(user.id, true);
            const unarchived = await userService.setArchived(user.id, false);
            expect(unarchived.archived).toBe(false);
        });

        it("should throw NotFoundError for non-existent user", async () => {
            await expect(
                userService.setArchived(
                    "00000000-0000-0000-0000-000000000000",
                    true
                )
            ).rejects.toThrow(NotFoundError);
        });
    });
});
