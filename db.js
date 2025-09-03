const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const user = new Schema({
    name : String,
    email : { type : String, required : true },
    password : String
})

const Todo = new Schema ({
    userId : ObjectId,
    title : String,
    done : Boolean
})

const UserModel = mongoose.model('users', user)
const TodoModel = mongoose.model('todos', Todo)

module.exports = {
    UserModel,
    TodoModel
}
