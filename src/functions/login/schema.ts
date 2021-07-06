import { User } from "@prisma/client";

export default {
    type: "object",
    properties: {
        email: { type: "string" },
        password: { type: "string" },
    },
    required: ["email", "password"],
} as const;

export type LoginResponse = {
    user: Partial<User>;
    token: string;
    refreshToken: string;
};
