import { APIGatewayProxyResult } from "aws-lambda";

type ResponseBody<T> = {
    result: boolean;
    code?: number;
    message: string;
    data?: T | null;
};

enum StatusCode {
    success = 200,
    serverError = 500,
    clientError = 400,
    notFound = 404,
    forbidden = 403,
    unauthorized = 401,
    tooManyRequests = 429,
}

class Result<T> {
    private result: boolean;
    private statusCode: StatusCode;
    private code: number;
    private message: string;
    private data?: T | null;

    constructor(
        result: boolean,
        statusCode: StatusCode,
        code: number,
        message: string,
        data?: T | null
    ) {
        this.result = result;
        this.statusCode = statusCode;
        this.code = code;
        this.message = message;
        this.data = data;
    }

    /**
     * Serverless: According to the API Gateway specs, the body content must be stringified
     */
    bodyToString(): APIGatewayProxyResult {
        const responseBody: ResponseBody<T> = {
            result: this.result,
            code: this.code,
            message: this.message,
            data: this.data,
        };

        if (this.result === true) {
            delete responseBody.code;
        }

        return {
            statusCode: this.statusCode,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify(responseBody),
        };
    }
}

export class MessageUtil {
    static success<T>(data: T | null): APIGatewayProxyResult {
        const result = new Result<T>(
            true,
            StatusCode.success,
            0,
            "success",
            data
        );
        return result.bodyToString();
    }

    static error<T>(
        statusCode: StatusCode = StatusCode.serverError,
        code: number = 1000,
        message: string,
        data: T | null = null
    ): APIGatewayProxyResult {
        const result = new Result<T>(false, statusCode, code, message, data);
        return result.bodyToString();
    }

    static errorCode = StatusCode;
}
