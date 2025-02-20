import { IFieldResolver } from "@graphql-tools/utils";
import { S3Lib } from "@libs/S3";
import { OptionPaymentTerm } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { ImageUploadInput, ImageUploadResult } from "../media";
import { OptionObject, toOptionSelect } from "./OptionObject";

function validateAddOptionInput(input: AddOptionInput): AddOptionInput {
    let {
        additionalPrice,
        cutOffBeforeDays,
        cutOffTillTime,
        description,
        endReservation,
        endUsage,
        name,
        paymentTerm,
        startReservation,
        startUsage,
        stock,
        photos,
    } = input;

    description = description?.trim();
    name = name?.trim();

    if (isEmpty(description)) throw new GqlError({ code: "BAD_USER_INPUT", message: "説明は空にできません" });

    if (isEmpty(name)) throw new GqlError({ code: "BAD_USER_INPUT", message: "名前は空にできません" });

    if (startUsage?.getTime() > endUsage?.getTime())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な使用期間" });

    if (startReservation?.getTime() > endReservation?.getTime())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な予約期間" });

    if (cutOffBeforeDays && cutOffBeforeDays < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な締め切り日" });

    if ((additionalPrice && !paymentTerm) || (!additionalPrice && paymentTerm))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "支払い条件と追加料金を入力してください" });

    if (additionalPrice && additionalPrice < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な追加料金" });

    if (stock && stock < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "在庫数が無効です" });

    if (!photos) photos = [];

    return {
        additionalPrice,
        cutOffBeforeDays,
        cutOffTillTime,
        description,
        endReservation,
        endUsage,
        name,
        paymentTerm,
        startReservation,
        startUsage,
        stock,
        photos,
    };
}

type AddOptionInput = {
    name: string;
    description: string;
    startUsage: Date;
    endUsage: Date;
    startReservation: Date;
    endReservation: Date;
    cutOffBeforeDays: number;
    cutOffTillTime: Date;
    paymentTerm: OptionPaymentTerm;
    additionalPrice: number;
    stock: number;
    photos: ImageUploadInput[];
};

type AddOptionArgs = { input: AddOptionInput };

type AddOptionResult = {
    message: string;
    option?: OptionObject;
    uploadRes: ImageUploadResult[];
};

type AddOption = IFieldResolver<any, Context, AddOptionArgs, Promise<AddOptionResult>>;

const addOption: AddOption = async (_, { input }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const validInput = validateAddOptionInput(input);
    const { photos, ...data } = validInput;

    const optionSelect = toOptionSelect(mapSelections(info)?.option)?.select || { id: true };
    const option = await store.option.create({
        data: {
            ...data,
            account: { connect: { id: accountId } },
            photos: { createMany: { data: photos.map(({ mime }) => ({ mime: mime || "image/jpeg", type: "Cover" })) } },
        },
        select: { ...optionSelect, photos: true },
    });

    const S3 = new S3Lib("upload");
    const uploadRes = option.photos
        ?.filter(({ medium, small, large }) => !medium && !small && !large)
        .map(({ id, mime, type }) => {
            const key = `${id}.${mime.split("/")[1]}`;
            const url = S3.getUploadUrl(key, mime, 60 * 10);
            return { key, mime, type, url };
        });

    Log(option, uploadRes);

    return {
        message: "オプションが追加されました",
        option,
        uploadRes,
    };
};

export const addOptionTypeDefs = gql`
    input AddOptionInput {
        name: String!
        description: String!
        startUsage: Date
        endUsage: Date
        startReservation: Date
        endReservation: Date
        cutOffBeforeDays: Int
        cutOffTillTime: Time
        paymentTerm: OptionPaymentTerm
        additionalPrice: Int
        stock: Int
        photos: [ImageUploadInput]
    }

    type AddOptionResult {
        message: String!
        option: OptionObject
        uploadRes: [ImageUploadResult]
    }

    type Mutation {
        addOption(input: AddOptionInput!): AddOptionResult @auth(requires: [host])
    }
`;

export const addOptionResolvers = { Mutation: { addOption } };
