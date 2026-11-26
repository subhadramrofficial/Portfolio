import mongoose from "mongoose";

export const isDbReady = () => mongoose.connection.readyState === 1;

export async function connectDB(uri) {
  mongoose.connection.on("disconnected", () => console.warn("[db] MongoDB disconnected"));
  mongoose.connection.on("reconnected", () => console.log("[db] MongoDB reconnected"));
  mongoose.connection.on("error", (err) => console.error("[db] MongoDB error:", err.name));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log("[db] MongoDB connected");
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
