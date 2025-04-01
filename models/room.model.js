import mongoose from "mongoose";
import bcrypt from "bcrypt";

const roomSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
    // max_participants: {
    //   type: Number,
    //   default: 8,
    // },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
  { timestamps: true }
);

roomSchema.pre("save", async function (next) {
  if(!this.isModified("password")) return next();
  // Hash the password before saving
  this.password = await bcrypt.hash(this.password, 10);
  next();
})

export default mongoose.model("rooms", roomSchema);
