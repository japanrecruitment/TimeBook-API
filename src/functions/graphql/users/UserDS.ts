import { MongoDataSource } from "apollo-datasource-mongodb";
import { ApolloError } from "apollo-server-errors";
import { User, UserDocument, UserModel } from "src/model";

class UserDS extends MongoDataSource<UserDocument> {
    constructor() {
        super(UserModel);
    }

    getAllUsers = async () => {
        const users = await UserModel.find({});
        console.log("getAllUsers: ", users);
        return users || [];
    };

    getUserById = async (userId: string) => {
        if (!userId) return null;
        const user = await this.findOneById(userId);
        if (!user) throw new ApolloError("No such user exists");
        console.log("getUserById: ", user.toJSON());
        return user;
    };

    getManyUserByIds = async (userIds: string[]) => {
        if (!userIds || userIds.length === 0) return [];
        const users = await this.findManyByIds(userIds);
        console.log("getManyUserByIds: ", users);
        return users;
    };

    updateProfile = async (
        user: Required<Pick<User, "id">> & Partial<Omit<User, "id">>
    ) => {
        const existingUser = await this.getUserById(user.id);
        existingUser.firstName = user.firstName ?? existingUser.firstName;
        existingUser.lastName = user.lastName ?? existingUser.lastName;
        existingUser.bio = user.bio ?? user.bio;
        const updatedUser = await existingUser.save();
        this.deleteFromCacheById(user.id);
        console.log("updateProfile updatedUser: ", updatedUser.toJSON());
        return updatedUser;
    };
}

export default UserDS;
