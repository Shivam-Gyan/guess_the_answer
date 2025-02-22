import userModel from "../../models/user.models.js";

const userServices={

    getByEmail: async (email) => {
        const user=await userModel.findOne({ email }).select("+password");
        if(!user){
            throw new Error("user not exist")
        }
        return user;
    },
    addUser: async (userData) => {
        const user = new userModel(userData);
        await user.save();
        if(!user){
            throw new Error("Error while register the user")
        }
        return user;
    }
}

export default userServices;