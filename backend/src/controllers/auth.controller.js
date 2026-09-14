import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import { generateToken } from "../utils/jwt.js";


export const register = async (req, res) => {
    const {
        name,
        email,
        phone,
        password,
    } = req.body;

    const existingUser = await User.findOne({
        $or: [
            {email},
            {phone}
        ]
    });
    if(existingUser){
        if(existingUser.email === email) {
            throw new AppError("Email is already registered", 409);
        }

        if (existingUser.phone === phone) {
            throw new AppError("Phone is already registered", 409);
        }
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const user = User.create({
        name,
        email,
        phone,
        password: hashPassword 
    });

    res.status(201).json({
        success: true,
        message: "Registation Successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        }
    });
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User
        .findOne({email})
        .select("+password")

    if(!user) {
        throw new AppError("Invalid email or password", 401);
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if(!isPasswordCorrect) {
        throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        success: true,
        message: "Login Successfully",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        }
    });
};

export const logout = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    res.status(200).json({
        success: true,
        message: "Logout successful"
    });
};