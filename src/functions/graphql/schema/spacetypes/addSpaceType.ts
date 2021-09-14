import { IFieldResolver } from "@graphql-tools/utils";
import { DocumentType } from "@prisma/client";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type SpaceTypeInput = {
    title: string;
    description: string;
    photoGalleryId: string;
};

type SpaceType = IFieldResolver<any, Context, Record<"input", SpaceTypeInput>, Promise<Result>>;

const addSpaceType: SpaceType = async (_, { input }, { store, dataSources }) => {
    const { title, description, photoGalleryId } = input;
    const isValid = title.trim() && description.trim();
    if (!isValid) throw new GqlError({ code: "BAD_USER_INPUT", message: "Provide all neccessary fields" });
    const spaceType = await store.spaceType.findFirst({ where: { title } });
    if (spaceType)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "The title for space type is already in use" });
    await store.spaceType.create({
        data: {
            title,
            description,
            Media: {
                create: {
                    documentType: DocumentType.OtherDocuments,
                    photoGallery: { connect: { id: photoGalleryId } },
                },
            },
        },
    });
    dataSources.redis.deleteMany("space-types:*");
    return { message: `Successfully registered space type` };
};

export const addSpaceTypeTypeDefs = gql`
    input AddSpaceTypeInput {
        title: String!
        description: String!
        photoGalleryId: String!
    }

    type Mutation {
        addSpaceType(input: AddSpaceTypeInput!): Space! @auth(requires: [user, host])
    }
`;

export const addSpaceTypeResolvers = {
    Mutation: { addSpaceType },
};
