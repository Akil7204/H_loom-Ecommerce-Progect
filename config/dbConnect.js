const mongoose = require('mongoose')

function connectDB(){

mongoose.set('strictQuery',false)
mongoose.connect("mongodb://127.0.0.1:27017/newHandloom").then(result=>{
     console.log("Database connected")

}).catch ((err)=>{
    console.log("database error \n" +err)
})

}

module.exports=connectDB