import userModel from "../../models/user.models.js";

const userServices={
    getByEmail: async (email) => {
        return await User.findOne({ email });
    },
    addUser: async (userData) => {
        const user = new userModel(userData);
        return await user.save();
    }
}

export default userServices;