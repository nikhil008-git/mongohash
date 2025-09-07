const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")

import { z } from "zod";
const JWT_SECRET = "your_jwt_secret";
const mongoose = require("mongoose")
const { UserModel , TodoModel }  = require("./db")
mongoose.connect("")
const app = express();
import { signupSchema, signinSchema } from "./schema/authschema";
import { createTodoSchema } from "./schema/todoSchema";
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post("/signup",  async function(req, res) {
   try { console.log("this is signup endpoint")
    const parsedData = signupSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            message: parsedData.error.errors.map(e => e.message).join(", ")
        });
    }
    const email = parsedData.data.email;
    const password = parsedData.data.password;
    const name = parsedData.data.name;
    const hashedPassword = await bcrypt.hash(password, 10);
    await UserModel.create({
        email: email,
        password: hashedPassword,
        name: name
    });
    
    res.json({  
        message: "You are signed up"
    })}
    catch(err){
        if(err.code === 11000){
            res.status(400).json({
                message: "User already exists"
            })
        }else{
            res.status(500).json({
                message: "Internal server error"
            })
        }

app.post("/signin", async function(req, res) {
   try{
    const parsedData = signinSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            message: parsedData.error.errors.map(e => e.message).join(", ")
        });
    }
    const email = parsedData.data.email;
    const password = parsedData.data.password;

    const response = await UserModel.findOne({
        email: email,
      
    });
    const passwordMatch = await bcrypt.compare(password, response.password);

    if (response && passwordMatch) {
        const token = jwt.sign({
            id: response._id.toString()
        }, JWT_SECRET);

        res.json({
            token
        })
    } } catch(err) {
        res.status(403).json({
            message: "Incorrect creds"
        })
    }
});

function auth(req, res, next) {
    const token = req.headers.token;

    const response = jwt.verify(token, JWT_SECRET);

    if (response) {
        req.userId = response.id;
        next();
    } else {
        res.status(403).json({
            message: "Incorrect creds"
        })
    }
}

app.post("/todo", auth, async function(req, res) {
    try {
        const parsed = createTodoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.errors });
    }
        const userId = req.userId;
        const title = parsed.data.title;
        const done = parsed.data.done;

    await TodoModel.create({
        userId,
        title,
        done
    });

    res.json({
        message: "Todo created"
    })
} catch(err) {
    res.status(500).json({
        message: "Internal server error"
    })
}
});
app.get("/todos", auth, async function(req, res) {
  try {
    const parsed = createTodoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.errors });
    }
    const userId = req.userId;

    const todos = await TodoModel.find({
        userId
    });

    res.json({
        todos
    }) } catch(err) {
        res.status(500).json({
            message: "Internal server error"
        })
    }
});

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
});
    }
});
