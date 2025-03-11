import { Strategy } from "../entities/strategy.entity";
import { User } from "../entities/user.entity";
import { AlreadyExistsError } from "../errors/already-exists.error";
import { NotFoundError } from "../errors/not-found-error";
import DatabaseManager from "./database-manager.service";

class UserService {
    private static getRepository() {
        return DatabaseManager.getInstance().appDataSource.getRepository(User);
    }

    async setArchived(uuid: string, archived: boolean) {
        const user = await this.findById(uuid, true);
        user.archived = archived;
        return UserService.getRepository().save(user);
    }

    async userExists(username: string) {
        const user = await UserService.getRepository().findOne({
            where: [{ username: username }],
        });

        return user ? true : false;
    }

    async findByUsername(username: string) {
        const user = await UserService.getRepository().findOneBy({
            username: username,
        });

        if (!user) {
            throw new NotFoundError("user", "username");
        }

        return user;
    }

    async findById(uuid: string, includeArchived = false) {
        const user = await UserService.getRepository().findOneBy({
            id: uuid,
            archived: includeArchived,
        });

        if (!user) {
            throw new NotFoundError("user", "uuid");
        }

        return user;
    }

    async create(username: string, password: string, salt: string) {
        if (await this.userExists(username)) {
            throw new AlreadyExistsError("Username already used");
        }
        const user = new User();
        user.username = username;
        user.password = password;
        user.salt = salt;
        return UserService.getRepository().save(user);
    }

    async addStrategy(uuid: string, strategy: Strategy) {
        const user = await this.findById(uuid);
        user.strategies.push(strategy);
        return UserService.getRepository().save(user);
    }
}

export const userService = new UserService();
