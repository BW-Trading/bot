import crypto from "crypto";
import { userService } from "./user.service";
import { User } from "../entities/user.entity";
import jwt, { JwtPayload } from "jsonwebtoken";
import { appEnv } from "../utils/env/app-env";
import { UnauthenticatedError } from "../errors/unauthenticated.error";
import { InvalidCredentialsError } from "../errors/invalid-credentials.error";

class AuthService {
    generateSalt(saltLength = 16) {
        return crypto.randomBytes(saltLength).toString("hex");
    }

    generateJwt(user: User) {
        const payload: JwtPayload = {
            iss: appEnv.app.domain,
            sub: user.id,
            aud: ["all"],
            iat: Date.now(),
            exp: Date.now() + +appEnv.auth.jwtExpiresIn,
            jti: this.generateSalt(),
            context: {
                user: {
                    id: user.id,
                    username: user.username,
                },
            },
        };

        const token = jwt.sign(payload, appEnv.auth.jwtSecret);

        return token;
    }

    hashPassword(password: string, salt: string) {
        return crypto
            .pbkdf2Sync(password, salt, 310000, 32, "sha256")
            .toString("hex");
    }

    isValidJwt(jwToken: string): JwtPayload {
        try {
            return jwt.verify(jwToken, appEnv.auth.jwtSecret) as JwtPayload;
        } catch (err) {
            throw new UnauthenticatedError();
        }
    }

    async verifyPassword(
        password: string,
        salt: string,
        hashedPassword: string
    ): Promise<boolean> {
        const derivedKey = this.hashPassword(password, salt);
        return crypto.timingSafeEqual(
            Buffer.from(hashedPassword, "hex"),
            Buffer.from(derivedKey, "hex")
        );
    }

    async loginUsernamePassword(username: string, password: string) {
        const user = await userService.findByUsername(username);

        if (user.archived) {
            throw new InvalidCredentialsError();
        }

        const isPasswordCorrect = await this.verifyPassword(
            password,
            user.salt,
            user.password
        );

        if (!isPasswordCorrect) {
            throw new InvalidCredentialsError();
        }

        const token = this.generateJwt(user);

        return { user: user, token: token };
    }

    async signup(username: string, password: string) {
        const salt = this.generateSalt();
        const hashedPassword = this.hashPassword(password, salt);
        return userService.create(username, hashedPassword, salt);
    }
}

export const authService = new AuthService();
