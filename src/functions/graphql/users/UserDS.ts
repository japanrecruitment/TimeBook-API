import { ApolloError } from "apollo-server-lambda";
import { User } from "@prisma/client";
import { encodePassword, Log, randomNumberOfNDigits } from "@utils/index";
import PrismaDataSource from "@libs/PrismaDataSource";
import { GQLError } from "../core";
import { addEmailToQueue, EmailTemplates, EmailVerificationData, ResetPasswordData } from "@utils/email-helper";
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
        Log("getUserByEmail: ", user);
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
        const userAlreadyExists = (await this.getUserByEmail(email)) !== null;
        if (userAlreadyExists) throw new GQLError({ message: "User with this email already exists" });
        const encodedPassword = encodePassword(password);
        const newUser = await this.store.user.create({ data: { ...user, password: encodedPassword } });
        this.sendEmailVerificationCode(newUser);
        console.log("[SUCCESS]: register user ");
        Log(newUser);
        return newUser;
    };

    sendEmailVerificationCode = async (user: Required<Pick<User, "email">> & Partial<Omit<User, "email">>) => {
        if (!user.id) {
            user = await this.getUserByEmail(user.email);
            if (!user) throw new GQLError({ code: "NOT_FOUND", message: "User with the given email not found" });
        }
        const verificationCode = randomNumberOfNDigits(6);
        this.storeInCache(`email-verification-code-${user.email}`, verificationCode, 600);
        await addEmailToQueue<EmailVerificationData>({
            template: "email-verification",
            recipientEmail: user.email,
            recipientName: `${user.firstName} ${user.lastName}`,
            verificationCode,
        });
        return user;
    };

    verifyEmail = async (email: string, code: number) => {
        const cacheCode = await this.fetchFromCache(`email-verification-code-${email}`);
        if (cacheCode !== code) throw new GQLError({ code: "BAD_REQUEST", message: "Verificaiton code expired" });
        const user = this.store.user.update({ where: { email }, data: { emailVerified: true } });
        if (!user) throw new GQLError({ code: "NOT_FOUND", message: "User with the given email not found" });
        console.log("[SUCCESS]: verifying email");
        Log(user);
        return user;
    };

    sendResetPasswordVerificationCode = async (user: Required<Pick<User, "email">> & Partial<Omit<User, "email">>) => {
        if (!user.id) {
            user = await this.getUserByEmail(user.email);
            if (!user) throw new GQLError({ code: "NOT_FOUND", message: "User with the given email not found" });
        }
        const verificationCode = randomNumberOfNDigits(6);
        this.storeInCache(`reset-password-verification-code-${user.email}`, verificationCode, 600);
        await addEmailToQueue<ResetPasswordData>({
            template: "reset-password",
            recipientEmail: user.email,
            recipientName: `${user.firstName} ${user.lastName}`,
            verificationCode,
        });
        return user;
    };

    verifyResetPasswordCode = async (email: string, code: number) => {
        const cacheCode = await this.fetchFromCache(`reset-password-verification-code-${email}`);
        if (cacheCode !== code) throw new GQLError({ code: "BAD_REQUEST", message: "Reset password code expired" });
        return true;
    };

    resetPassword = async (email: string, newPassword: string, code: number) => {
        this.verifyResetPasswordCode(email, code);
        const encodedPassword = encodePassword(newPassword);
        const user = this.store.user.update({ where: { email }, data: { password: encodedPassword } });
        if (!user) throw new GQLError({ code: "NOT_FOUND", message: "User with the given email not found" });
        console.log("[SUCCESS]: reset password");
        Log(user);
        return user;
    };
}

export default UserDS;
