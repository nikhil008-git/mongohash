olution
const express = require("express");

const app = express();
app.use(express.json());

app.post("/signup", function(req, res) {
    
});


app.post("/signin", function(req, res) {

});


app.post("/todo", function(req, res) {

});


app.get("/todos", function(req, res) {

});

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
});