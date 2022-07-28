import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { OptionObject, toOptionSelect } from "./OptionObject";

type MyOptionsArgs = {
    hotelId: string;
    packagePlanId: string;
    spaceId: string;
};

type MyOptionsResult = OptionObject[];

type MyOptions = IFieldResolver<any, Context, MyOptionsArgs, Promise<MyOptionsResult>>;

const myOptions: MyOptions = async (_, { hotelId, packagePlanId, spaceId }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const optionSelect = toOptionSelect(mapSelections(info))?.select;
    const options = await store.option.findMany({
        where: {
            accountId,
            packagePlans: hotelId || packagePlanId ? { some: { id: packagePlanId, hotelId } } : undefined,
            spaces: spaceId ? { some: { id: spaceId } } : undefined,
        },
        select: optionSelect,
    });

    Log(`myOptions: `, options);

    return options;
};

export const myOptionsTypeDefs = gql`
    type Query {
        myOptions(hotelId: ID, packagePlanId: ID, spaceId: ID): [OptionObject] @auth(requires: [host])
    }
`;

export const myOptionsResolvers = { Query: { myOptions } };
