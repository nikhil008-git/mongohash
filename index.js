// server.js

import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { UserModel, TodoModel } from "./db.js";
import { signupSchema, signinSchema } from "./schema/authschema.js";
import { createTodoSchema } from "./schema/todoSchema.js";

// -------------------- CONFIG --------------------
const app = express();
app.use(express.json());

const JWT_SECRET = "your_jwt_secret"; // ideally use process.env.JWT_SECRET
const mongoose = "";

// -------------------- AUTH MIDDLEWARE --------------------
function auth(req, res, next) {
    try {
        const token = req.headers.token;
        if (!token) throw new Error("No token provided");

        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(403).json({ message: "Incorrect creds" });
    }
}

// -------------------- SIGNUP --------------------
app.post("/signup", async (req, res) => {
    try {
        const parsedData = signupSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({
                message: parsedData.error.errors.map(e => e.message).join(", ")
            });
        }

        const { email, password, name } = parsedData.data;

        // Check if user exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await UserModel.create({ email, password: hashedPassword, name });

        res.json({ message: "You are signed up" });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// -------------------- SIGNIN --------------------
app.post("/signin", async (req, res) => {
    try {
        const parsedData = signinSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({
                message: parsedData.error.errors.map(e => e.message).join(", ")
            });
        }

        const { email, password } = parsedData.data;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(403).json({ message: "Incorrect creds" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(403).json({ message: "Incorrect creds" });
        }

        const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// -------------------- CREATE TODO --------------------
app.post("/todo", auth, async (req, res) => {
    try {
        const parsed = createTodoSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.errors });
        }

        const { title, done } = parsed.data;
        const userId = req.userId;

        await TodoModel.create({ userId, title, done });
        res.json({ message: "Todo created" });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// -------------------- GET TODOS --------------------
app.get("/todos", auth, async (req, res) => {
    try {
        const userId = req.userId;
        const todos = await TodoModel.find({ userId });
        res.json({ todos });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// -------------------- START SERVER --------------------
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
