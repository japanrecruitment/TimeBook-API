import { SchemaDirectiveVisitor } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { defaultFieldResolver } from "graphql";
import { S3Lib } from "@libs/index";

const S3 = new S3Lib("media");

class SignMediaReadDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field) {
        const { resolve = defaultFieldResolver } = field;
        field.resolve = async (...args) => {
            const result = await resolve.apply(this, args);

            if (typeof result === "string") {
                return await S3.getDownloadUrl(result, this.args.ttl);
            }
            return result;
        };
    }
}

export const signMediaReadDirectiveTypeDefs = gql`
    directive @signMediaRead(ttl: Int = 86400) on FIELD_DEFINITION
`;

export const signMediaReadDirective = {
    signMediaRead: SignMediaReadDirective,
};
