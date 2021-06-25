import { gql } from "apollo-server-lambda";

export default gql`
    directive @upperFirstLetter on FIELD_DEFINITION
    directive @self on FIELD_DEFINITION
    directive @auth(requires: Role = ADMIN) on OBJECT | FIELD_DEFINITION
    directive @i18n on OBJECT

    enum Role {
        ADMIN
        USER
        UNKNOWN
    }

    type Image {
        url: String!
        height: Int
        width: Int
    }

    type ImageObject {
        url: String
        mimeType: String
        thumbnail: Image
        medium: Image
        large: Image
    }

    input ImageInput {
        url: String!
        height: Int
        width: Int
    }

    input ImageObjectInput {
        url: String
        mimeType: String
        thumbnail: ImageInput
        medium: ImageInput
        large: ImageInput
    }

    type Query {
        _empty: String
    }

    type Mutation {
        _empty: String
    }
`;
