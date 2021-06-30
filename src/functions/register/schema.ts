export interface RegisterParams {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    firstNameKana: string;
    lastNameKana: string;
}

const RegisterParams = {
    type: "object",
    properties: {
        email: { type: "string" },
        password: { type: "string" },
        firstName: { type: "string" },
        lastName: { type: "string" },
        firstNameKana: { type: "string" },
        lastNameKana: { type: "string" },
    },
    required: ["email", "password", "firstName", "lastName", "firstNameKana", "lastNameKana"],
};

export default RegisterParams;

export interface RegisterResponse {
    message?: string;
    token?: string;
    action?: "login" | "verify-email" | "resend-verification-email" | "additional-info-host";
}

export interface RegisterError {
    message?: string;
    action?: string;
}