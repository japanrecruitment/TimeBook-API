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
        photos,
    } = input;

    description = description?.trim();
    name = name?.trim();

    if (isEmpty(description))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Option description cannot be empty" });

    if (isEmpty(name)) throw new GqlError({ code: "BAD_USER_INPUT", message: "Option name cannot be empty" });

    if (startUsage?.getTime() > endUsage?.getTime())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid usage period" });

    if (startReservation?.getTime() > endReservation?.getTime())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid reservation period" });

    if (cutOffBeforeDays && cutOffBeforeDays < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid cut off before days" });

    if ((additionalPrice && !paymentTerm) || (!additionalPrice && paymentTerm))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Provide both payment term and additional price" });

    if (additionalPrice && additionalPrice < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid addtional price" });

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
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

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
        message: "Successfully added a option",
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
