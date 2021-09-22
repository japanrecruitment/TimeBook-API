import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addProfilePhotoResolvers, addProfilePhotoTypeDefs } from "./addProfilePhoto";
import { allAccountsResolvers, allAccountsTypeDefs } from "./allAccounts";
import { companyProfileObjectTypeDefs } from "./CompanyProfile";
import { myProfileResolvers, myProfileTypeDefs } from "./myProfile";
import { profileObjectResolvers, profileObjectTypeDefs } from "./ProfileObject";
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
]);

export const profileResolvers = mergeResolvers([
    profileObjectResolvers,
    allAccountsResolvers,
    myProfileResolvers,
    updateMyProfileResolvers,
    addProfilePhotoResolvers,
]);

export * from "./UserProfileObject";
export * from "./CompanyProfile";
export * from "./ProfileObject";
