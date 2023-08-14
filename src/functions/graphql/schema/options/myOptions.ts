import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import {
    createPaginationResult,
    createPaginationResultType,
    PaginationOption,
    PaginationResult,
} from "../core/pagination";
import { OptionObject, toOptionSelect } from "./OptionObject";

type MyOptionsArgs = {
    hotelId: string;
    packagePlanId: string;
    spaceId: string;
    paginate: PaginationOption;
};

type MyOptionsResult = PaginationResult<OptionObject>;

type MyOptions = IFieldResolver<any, Context, MyOptionsArgs, Promise<MyOptionsResult>>;

const myOptions: MyOptions = async (_, { hotelId, packagePlanId, spaceId, paginate }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const { skip, take } = paginate || {};

    const optionSelect = toOptionSelect(mapSelections(info)?.data)?.select;
    const options = await store.option.findMany({
        where: {
            accountId,
            // packagePlans: hotelId || packagePlanId ? { some: { id: packagePlanId, hotelId } } : undefined,
            // spaces: spaceId ? { some: { id: spaceId } } : undefined,
        },
        select: optionSelect,
        take: take && take + 1,
        skip,
    });

    Log(`myOptions: `, options);

    return createPaginationResult(options, take, skip);
};

export const myOptionsTypeDefs = gql`
    ${createPaginationResultType("MyOptionsResult", "OptionObject")}

    type Query {
        myOptions(hotelId: ID, packagePlanId: ID, spaceId: ID, paginate: PaginationOption): MyOptionsResult
            @auth(requires: [host])
    }
`;

export const myOptionsResolvers = { Query: { myOptions } };
