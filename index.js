import express from 'express'
import mongoose from 'mongoose'
const { UserModel, TodoModel } = require("./db");

const app = express()

app.use(express.json())

const JWT_SECRET = "s3cret";

app.post("/signup", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    await UserModel.create({
        email: email,
        password: password,
        name: name
    });
    
    res.json({
        message: "You are signed up"
    })
});


app.post("/signin", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const response = await UserModel.findOne({
        email: email,
        password: password,
    });

    if (response) {
        const token = jwt.sign({
            id: response._id.toString()
        })

        res.json({
            token
        })
    } else {
        res.status(403).json({
            message: "Incorrect creds"
        })
    }
});
app.post('/todo',function(req,res){

})
app.get('/todos',(req,res)=>{

})

app.listen(3000,()=>{
    console.log('Server is running on port 3000')
})