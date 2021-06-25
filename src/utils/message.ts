export type Response = {
    statusCode: number;
    body: string;
};

type ResponseBody = {
    result: boolean;
    code?: number;
    message: string;
    data?: object;
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

class Result {
    private result: boolean;
    private statusCode: number;
    private code: number;
    private message: string;
    private data?: any;

    constructor(result: boolean, statusCode: number, code: number, message: string, data?: any) {
        this.result = result;
        this.statusCode = statusCode;
        this.code = code;
        this.message = message;
        this.data = data;
    }

    /**
     * Serverless: According to the API Gateway specs, the body content must be stringified
     */
    bodyToString() {
        const responseBody: ResponseBody = {
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
    static success(data: object): Response {
        const result = new Result(true, StatusCode.success, 0, "success", data);
        return result.bodyToString();
    }

    static error(
        statusCode: StatusCode = StatusCode.serverError,
        code: number = 1000,
        message: string,
        data: any = null
    ): Response {
        const result = new Result(false, statusCode, code, message, data);
        return result.bodyToString();
    }

    static errorCode = StatusCode;
}
