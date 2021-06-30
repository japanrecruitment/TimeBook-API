import bcrypt from "bcryptjs";

export const encodePassword = (raw: string): string => {
    try {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(raw, salt);
    } catch (error) {
        console.log(error.message);
    }
};

export const comparePassword = (raw: string, encoded: string): boolean => {
    try {
        return bcrypt.compareSync(raw, encoded);
    } catch (error) {
        console.log(error.message);
    }
};
