import { IFieldResolver } from "@graphql-tools/utils";
import { S3Lib } from "@libs/S3";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { differenceWith } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { ImageUploadInput, ImageUploadResult } from "../../media";

type AddPackagePlanPhotosArgs = {
    packagePlanId: string;
    photos: ImageUploadInput[];
};

type AddPackagePlanPhotosResult = {
    message: string;
    uploadRes?: ImageUploadResult[];
};

type AddPackagePlanPhotos = IFieldResolver<any, Context, AddPackagePlanPhotosArgs, Promise<AddPackagePlanPhotosResult>>;

const addPackagePlanPhotos: AddPackagePlanPhotos = async (_, { packagePlanId, photos }, { authData, store }) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const packagePlan = await store.packagePlan.findUnique({
        where: { id: packagePlanId },
        select: { hotel: { select: { accountId: true } }, photos: { select: { id: true } } },
    });
    if (!packagePlan || !packagePlan.hotel)
        throw new GqlError({ code: "NOT_FOUND", message: "プランが見つかりません。" });

    if (accountId !== packagePlan.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const updatedPackagePlan = await store.packagePlan.update({
        where: { id: packagePlanId },
        data: {
            photos: { createMany: { data: photos.map(({ mime }) => ({ mime: mime || "image/jpeg", type: "Cover" })) } },
        },
        select: { photos: true },
    });

    const newPhotos = differenceWith(updatedPackagePlan.photos, packagePlan.photos, (a, b) => a.id === b.id);

    const S3 = new S3Lib("upload");
    const uploadRes = newPhotos
        ?.filter(({ medium, small, large }) => !medium && !small && !large)
        .map(({ id, mime, type }) => {
            const key = `${id}.${mime.split("/")[1]}`;
            const url = S3.getUploadUrl(key, mime, 60 * 10);
            return { key, mime, type, url };
        });

    Log(updatedPackagePlan, uploadRes);

    return {
        message: `写真がアップロードされました。`,
        uploadRes,
    };
};

export const addPackagePlanPhotosTypeDefs = gql`
    type AddPackagePlanPhotosResult {
        message: String!
        uploadRes: [ImageUploadResult]
    }

    type Mutation {
        addPackagePlanPhotos(packagePlanId: ID!, photos: [ImageUploadInput!]!): AddPackagePlanPhotosResult
            @auth(requires: [host])
    }
`;

export const addPackagePlanPhotosResolvers = { Mutation: { addPackagePlanPhotos } };
