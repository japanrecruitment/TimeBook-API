import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addOptionResolvers, addOptionTypeDefs } from "./addOption";
import { addOptionPhotosResolvers, addOptionPhotosTypeDefs } from "./addOptionPhotos";
import { myOptionsResolvers, myOptionsTypeDefs } from "./myOptions";
import { optionByIdResolvers, optionByIdTypeDefs } from "./optionById";
import { optionObjectTypeDefs, optionObjectResolvers } from "./OptionObject";
import { removeOptionResolvers, removeOptionTypeDefs } from "./removeOption";
import { removeOptionPhotoResolvers, removeOptionPhotoTypeDefs } from "./removeOptionPhoto";
import { updateOptionResolvers, updateOptionTypeDefs } from "./updateOption";

export const typeDefs = mergeTypeDefs([
    addOptionTypeDefs,
    addOptionPhotosTypeDefs,
    myOptionsTypeDefs,
    optionByIdTypeDefs,
    optionObjectTypeDefs,
    removeOptionPhotoTypeDefs,
    removeOptionTypeDefs,
    updateOptionTypeDefs,
]);

export const resolvers = mergeResolvers([
    addOptionResolvers,
    addOptionPhotosResolvers,
    myOptionsResolvers,
    optionByIdResolvers,
    optionObjectResolvers,
    removeOptionPhotoResolvers,
    removeOptionResolvers,
    updateOptionResolvers,
]);

export * from "./OptionObject";
