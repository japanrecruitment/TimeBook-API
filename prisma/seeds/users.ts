import { User } from "@prisma/client";
import { encodePassword } from "../../src/utils";

export const users: Partial<User>[] = [
    {
        firstName: "Avinash",
        lastName: "Gurung",
        firstNameKana: "アビナシュ",
        lastNameKana: "グルング",
    },
    {
        firstName: "Sudan",
        lastName: "Thapa",
        firstNameKana: "スダン",
        lastNameKana: "タパ",
    },
];

export const userProcessor = (user: Partial<User>): Partial<User> => {
    // user.password = encodePassword(user.password);
    return user;
};
