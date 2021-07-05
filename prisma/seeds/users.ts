import { User } from "@prisma/client";
import { encodePassword } from "../../src/utils";

export const users: Partial<User>[] = [
    {
        email: "approved.user@mail.com",
        password: "wakeup",
        firstName: "Avinash",
        lastName: "Gurung",
        firstNameKana: "アビナシュ",
        lastNameKana: "グルング",
        approved: true,
        emailVerified: true,
    },
    {
        email: "unapproved.user@mail.com",
        password: "wakeup",
        firstName: "Sudan",
        lastName: "Thapa",
        firstNameKana: "スダン",
        lastNameKana: "タパ",
    },
];

export const userProcessor = (user: Partial<User>): Partial<User> => {
    user.password = encodePassword(user.password);
    return user;
};
