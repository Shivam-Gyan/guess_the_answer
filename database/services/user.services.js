import userModel from "../../models/user.models.js";

const userServices={

    getByEmail: async (email) => {
        const user=await userModel.findOne({ email }).select("+password");
        return user;
    },

    addUser: async (userData) => {
        const user = new userModel(userData);
        await user.save();
        if(!user){
            throw new Error("Error while register the user")
        }
        return user;
    },

    getLastUser: async () => {
        return await userModel.findOne().sort({createdAt:-1}).exec();
    }
}

export default userServices;