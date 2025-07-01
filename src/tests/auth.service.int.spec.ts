// tests/auth.service.int.spec.ts
import { DataSource } from "typeorm";
import jwt, { JwtPayload } from "jsonwebtoken";
import { createTestDataSource } from "../test-datasource";
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth.service";
import { User } from "../../src/entities/user.entity";
import { UnauthenticatedError } from "../errors/unauthenticated.error";
import { InvalidCredentialsError } from "../errors/invalid-credentials.error";
import { appEnv } from "../utils/env/app-env";

describe("AuthService – tests d’intégration", () => {
    let ds: DataSource;
    let userService: UserService;
    let authService: AuthService;

    beforeAll(async () => {
        ds = await createTestDataSource();
        userService = new UserService();
        authService = new AuthService();
    });

    afterAll(async () => {
        await ds.destroy();
    });

    afterEach(async () => {
        await ds.synchronize(true);
    });

    describe("signup & hashPassword", () => {
        it("signup: should create a new user with hashed password and salt", async () => {
            const username = "alice";
            const plain = "password123";
            const user = await authService.signup(username, plain);

            expect(user.id).toBeDefined();
            expect(user.username).toBe(username);
            expect(user.salt).toHaveLength(32); // default saltLength=16→hex32
            expect(user.password).not.toBe(plain);

            // verify stored hash matches
            const reloaded = await userService.findById(user.id);
            const derived = authService.hashPassword(plain, reloaded.salt);
            expect(derived).toBe(reloaded.password);
        });
    });

    describe("loginUsernamePassword", () => {
        const USERNAME = "bob";
        const PASSWORD = "secure!";
        let created: User;

        beforeEach(async () => {
            created = await authService.signup(USERNAME, PASSWORD);
        });

        it("should throw when user is archived", async () => {
            await userService.setArchived(created.id, true);
            await expect(
                authService.loginUsernamePassword(USERNAME, PASSWORD)
            ).rejects.toThrow(InvalidCredentialsError);
        });

        it("should throw on wrong password", async () => {
            await expect(
                authService.loginUsernamePassword(USERNAME, "wrongpass")
            ).rejects.toThrow(InvalidCredentialsError);
        });

        it("should return user and valid JWT on correct credentials", async () => {
            const { user, token } = await authService.loginUsernamePassword(
                USERNAME,
                PASSWORD
            );
            expect(user.id).toBe(created.id);

            // verify token payload
            const payload = jwt.verify(
                token,
                appEnv.auth.jwtSecret
            ) as JwtPayload;
            expect(payload.sub).toBe(created.id);
            expect((payload.context as any).user.username).toBe(USERNAME);
            // check expiration > issued at
            expect(payload.exp).toBeGreaterThan(payload.iat as number);
        });
    });

    describe("isValidJwt & unauthenticated handling", () => {
        it("isValidJwt: should verify a good token", () => {
            // sign a token manually
            const dummy: JwtPayload = {
                sub: "u1",
                iat: Date.now(),
                exp: Date.now() + 10000,
            };
            const token = jwt.sign(dummy, appEnv.auth.jwtSecret);
            const parsed = authService.isValidJwt(token);
            expect(parsed.sub).toBe("u1");
        });

        it("isValidJwt: should throw on invalid token", () => {
            expect(() => authService.isValidJwt("bad.token")).toThrow(
                UnauthenticatedError
            );
        });
    });
});
