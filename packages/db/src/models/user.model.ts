import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name:String,
        email:String,
    },
    {timestamps:true}
)

export const User =
  mongoose.models.User || mongoose.model("User", userSchema);

