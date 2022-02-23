import { Account, ProfileType, User, Company } from "@prisma/client";
import { encodePassword } from "../../src/utils/authUtils";

export type AccountSeed = {
    userProfile: { create: Partial<User> };
    companyProfile: { create: Partial<Company> };
};

export const users: Partial<Account & AccountSeed>[] = [
    {
        email: "user.verified@mail.com",
        emailVerified: true,
        password: "password",
        roles: ["user"],
        profileType: ProfileType.UserProfile,
        userProfile: {
            create: {
                firstName: "john",
                lastName: "doe",
                firstNameKana: "john",
                lastNameKana: "doe",
            },
        },
    },
    // {
    //     email: 'user.unverified@mail.com',
    //     emailVerified: false,
    //     password: "password",
    //     roles: ['user'],
    //     profileType: ProfileType.UserProfile,
    //     userProfile: {create: {
    //         firstName: "jane",
    //         lastName: "doe",
    //         firstNameKana: "jane",
    //         lastNameKana: "doe",
    //     }}
    // },
    // {
    //     email: 'company.verified@mail.com',
    //     emailVerified: false,
    //     password: "password",
    //     roles: ['user'],
    //     profileType: ProfileType.CompanyProfile,
    //     companyProfile: {create: {
    //         name: "ABC Co., Ltd.",
    //         nameKana: "ABC Co., Ltd.",
    //         registrationNumber: "AB123456789",
    //     }}
    // },
    // {
    //     email: 'company.unverified@mail.com',
    //     emailVerified: false,
    //     password: "password",
    //     roles: ['user'],
    //     profileType: ProfileType.CompanyProfile,
    //     companyProfile: {create: {
    //         name: "ABC Co., Ltd.",
    //         nameKana: "ABC Co., Ltd.",
    //         registrationNumber: "AB123456789",
    //     }}
    // },
];

export const userProcessor = (user: Partial<Account>): Partial<Account> => {
    user.password = encodePassword(user.password);
    return user;
};
