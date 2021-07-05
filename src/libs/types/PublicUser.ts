import { User } from "@prisma/client";
import { omit } from ".";

export const publicUser = (user: User) =>
    omit(
        user,
        "password",
        "createdAt",
        "dob",
        "phoneNumber",
        "phoneVerified",
        "suspended",
        "type",
        "approved",
        "emailVerified"
    );
