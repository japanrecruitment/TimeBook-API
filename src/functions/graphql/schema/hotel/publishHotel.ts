import { IFieldResolver } from "@graphql-tools/utils";
import { environment } from "@utils/environment";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { isEmpty, sortBy } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type PublishHotelArgs = { id: string; publish: boolean };

type PublishHotelResult = Result;

type PublishHotel = IFieldResolver<any, Context, PublishHotelArgs, Promise<PublishHotelResult>>;

const publishHotel: PublishHotel = async (_, { id, publish }, { authData, dataSources, store }) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    if (!publish) {
        const hotel = await store.hotel.findFirst({
            where: { id, accountId },
            select: { status: true },
        });
        if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "宿泊施設が見つかりません。" });

        if (hotel.status !== "PUBLISHED") return { message: `宿泊施設が非公開化に成功しました` };

        await store.hotel.update({ where: { id }, data: { status: "DRAFTED" } });

        await dataSources.hotelAlgolia.deleteObject(id);

        return { message: `宿泊施設が非公開化に成功しました` };
    }

    const hotel = await store.hotel.findFirst({
        where: { id, accountId },
        select: {
            buildingType: true,
            isPetAllowed: true,
            name: true,
            address: {
                select: { city: true, latitude: true, longitude: true, prefecture: { select: { name: true } } },
            },
            rooms: { select: { maxCapacityAdult: true, maxCapacityChild: true, name: true } },
            photos: { select: { id: true, mime: true } },
            packagePlans: {
                select: {
                    isBreakfastIncluded: true,
                    paymentTerm: true,
                    roomTypes: { select: { priceSettings: { select: { priceScheme: true } } } },
                    subcriptionPrice: true,
                },
            },
            nearestStations: { select: { stationId: true } },
            status: true,
        },
    });
    if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "宿泊施設が見つかりません。" });

    if (hotel.status === "PUBLISHED")
        throw new GqlError({ code: "BAD_REQUEST", message: "宿泊施設はすでに公開されています。" });

    if (!hotel.name) throw new GqlError({ code: "BAD_REQUEST", message: "名前が空です。" });

    if (!hotel.address) throw new GqlError({ code: "BAD_REQUEST", message: "住所は提供されていません。" });

    if (isEmpty(hotel.rooms))
        throw new GqlError({ code: "BAD_REQUEST", message: "宿泊施設には少なくとも 1 つの部屋が必要です" });

    if (isEmpty(hotel.photos))
        throw new GqlError({ code: "BAD_REQUEST", message: "宿泊施設には少なくとも 1 つの写真が必要です" });

    if (isEmpty(hotel.packagePlans))
        throw new GqlError({ code: "BAD_REQUEST", message: "宿泊施設には少なくとも 1 つのプランが必要です" });

    await store.hotel.update({ where: { id }, data: { status: "PUBLISHED" } });

    const thumbnailPhoto = hotel.photos[0];
    const publicBucketName = environment.PUBLIC_MEDIA_BUCKET;
    const awsRegion = "ap-northeast-1";
    const imageSize = "medium";
    const imageKey = `${thumbnailPhoto.id}.${thumbnailPhoto.mime.split("/")[1]}`;
    const mediumImageUrl = `https://${publicBucketName}.s3.${awsRegion}.amazonaws.com/${imageSize}/${imageKey}`;

    let highestPrice = 0;
    let lowestPrice = 9999999999;
    hotel.packagePlans.forEach(({ paymentTerm, roomTypes }) => {
        const selector = paymentTerm === "PER_PERSON" ? "oneAdultCharge" : "roomCharge";
        roomTypes.forEach(({ priceSettings }) => {
            priceSettings.forEach(({ priceScheme }) => {
                if (priceScheme[selector] > highestPrice) highestPrice = priceScheme[selector];
                if (priceScheme[selector] < lowestPrice) lowestPrice = priceScheme[selector];
            });
        });
    });

    let maxAdult = 0;
    let maxChild = 0;
    hotel.rooms.forEach(({ maxCapacityAdult, maxCapacityChild }) => {
        if (maxCapacityAdult > maxAdult) maxAdult = maxCapacityAdult;
        if (maxCapacityChild > maxChild) maxChild = maxCapacityAdult;
    });

    await dataSources.hotelAlgolia.saveObject({
        objectID: id,
        name: hotel.name,
        buildingType: hotel.buildingType,
        city: hotel.address.city,
        highestPrice,
        hotelRooms: hotel.rooms.map(({ name }) => name),
        isBreakfastIncluded: hotel.packagePlans.some(({ isBreakfastIncluded }) => isBreakfastIncluded),
        isPetAllowed: hotel.isPetAllowed,
        lowestPrice,
        maxAdult,
        maxChild,
        nearestStations: hotel.nearestStations.map(({ stationId }) => stationId),
        prefecture: hotel.address.prefecture.name,
        subcriptionPrice: hotel.packagePlans.map(({ subcriptionPrice }) => subcriptionPrice),
        thumbnail: mediumImageUrl,
        _geoloc: { lat: hotel.address.latitude, lng: hotel.address.longitude },
    });

    return { message: `宿泊施設を公開しました。` };
};

export const publishHotelTypeDefs = gql`
    type Mutation {
        publishHotel(id: ID!, publish: Boolean!): Result @auth(requires: [host])
    }
`;

export const publishHotelResolvers = { Mutation: { publishHotel } };
