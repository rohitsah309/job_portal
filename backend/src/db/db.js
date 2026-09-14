import mongoose from "mongoose"

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
    } catch (error) {
        console.error("Mongoose connection failed", error.message)

    }
}

export default connectDB;