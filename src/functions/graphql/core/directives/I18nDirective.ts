import { SchemaDirectiveVisitor } from "apollo-server-lambda";

class I18nDirective extends SchemaDirectiveVisitor {
    visitObject(type) {
        const fields = type.getFields();

        Object.keys(fields).forEach((fieldName) => {
            const field = fields[fieldName];
            if (!field.resolve) field.resolve = this.i18nFieldResolver;
        });
    }

    i18nFieldResolver = async (source, __, { locale }, { fieldName }) => {
        return source.get(`${fieldName}_${locale}`) || source.get(`${fieldName}`);
    };
}

export default I18nDirective;
