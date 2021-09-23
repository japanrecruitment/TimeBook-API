import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addProfilePhotoResolvers, addProfilePhotoTypeDefs } from "./addProfilePhoto";
import { allAccountsResolvers, allAccountsTypeDefs } from "./allAccounts";
import { approveAccountResolvers, approveAccountTypeDefs } from "./approveAccount";
import { companyProfileObjectTypeDefs } from "./CompanyProfileObject";
import { myProfileResolvers, myProfileTypeDefs } from "./myProfile";
import { accountByIdResolvers, accountByIdTypeDefs } from "./accountById";
import { profileObjectResolvers, profileObjectTypeDefs } from "./ProfileObject";
import { suspendAccountResolvers, suspendAccountTypeDefs } from "./suspendAccount";
import { updateMyProfileResolvers, updateMyProfileTypeDefs } from "./updateMyProfile";
import { userProfileObjectTypeDefs } from "./UserProfileObject";

export const profileTypeDefs = mergeTypeDefs([
    userProfileObjectTypeDefs,
    companyProfileObjectTypeDefs,
    profileObjectTypeDefs,
    allAccountsTypeDefs,
    myProfileTypeDefs,
    updateMyProfileTypeDefs,
    addProfilePhotoTypeDefs,
    suspendAccountTypeDefs,
    accountByIdTypeDefs,
    approveAccountTypeDefs,
]);

export const profileResolvers = mergeResolvers([
    profileObjectResolvers,
    allAccountsResolvers,
    myProfileResolvers,
    updateMyProfileResolvers,
    addProfilePhotoResolvers,
    suspendAccountResolvers,
    accountByIdResolvers,
    approveAccountResolvers,
]);

export * from "./UserProfileObject";
export * from "./CompanyProfileObject";
export * from "./ProfileObject";
