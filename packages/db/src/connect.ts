import mongoose from "mongoose";

let isConnected = false;

export async function connectDB(uri?:string) {
    if(isConnected) return;

    const mongoUri = uri || process.env.MONGO_URI;
    if(!mongoUri) throw new Error("MONGO_URI not found");
    
    await mongoose.connect(mongoUri)
    isConnected = true;
    console.log("MongoDB connected");   
}

export async function disconnectDB() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}