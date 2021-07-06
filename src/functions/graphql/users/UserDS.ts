import { ApolloError } from "apollo-server-lambda";
import { User } from "@prisma/client";
import { encodePassword, Log, randomNumberOfNDigits } from "@utils/index";
import PrismaDataSource from "@libs/PrismaDataSource";
import { GQLError } from "../core";
import { addEmailToQueue, EmailVerificationEmailData } from "@utils/email-helper";
class UserDS extends PrismaDataSource {
    getAllUsers = async (limit: number, after: number) => {
        const users = await this.store.user.findMany({
            take: limit,
            skip: after,
        });
        Log("getAllUsers: ", users);
        return users || [];
    };

    getUserById = async (userId: string) => {
        if (!userId) return null;
        const cacheDoc = await this.fetchFromCache(`getUserById-${userId}`);
        if (cacheDoc) return cacheDoc;
        const user = await this.store.user.findUnique({
            where: { id: userId },
        });
        if (!user) throw new ApolloError("No such user exists");
        this.storeInCache(`getUserById-${user.id}`, user, 100);
        Log("getUserById: ", user);
        return user;
    };

    getUserByEmail = async (email: string) => {
        if (!email) return null;
        const user = await this.store.user.findUnique({ where: { email } });
        Log("getUserById: ", user);
        return user;
    };

    getManyUserByIds = async (userIds: string[]) => {
        if (!userIds || userIds.length === 0) return [];
        const users = await this.store.user.findMany({
            where: { id: { in: userIds } },
        });
        Log("getManyUserByIds: ", users);
        return users;
    };

    registerUser = async (user: Omit<User, "id">) => {
        const { email, password, firstName, lastName, firstNameKana, lastNameKana } = user;
        const isValid =
            email.trim() &&
            password.trim() &&
            firstName.trim() &&
            lastName.trim() &&
            firstNameKana.trim() &&
            lastNameKana.trim();
        if (!isValid) throw new GQLError({ message: "Provide all necessary fields" });
        const userAlreadyExists = this.getUserByEmail(email) !== null;
        if (userAlreadyExists) throw new GQLError({ message: "User with this email already exists" });
        const encodedPassword = encodePassword(password);
        const newUser = await this.store.user.create({ data: { ...user, password: encodedPassword } });
        const verificationCode = randomNumberOfNDigits(6);
        this.storeInCache(`register-verification-code-${newUser.email}`, verificationCode, 600);
        await addEmailToQueue<EmailVerificationEmailData>({
            template: "email-verification",
            recipientEmail: newUser.email,
            recipientName: `${newUser.firstName} ${newUser.lastName}`,
            verificationCode,
        });
        console.log("[SUCCESS]: register user ");
        Log(newUser);
        return newUser;
    };
}

export default UserDS;
