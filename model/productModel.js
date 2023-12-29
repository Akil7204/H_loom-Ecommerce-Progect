
const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    category:{
        type:String,
         required:true
    },
    quantity:{
        type:String,
        required:true
    },
    mrp:{
        type:Number,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    mainImage:{
        type:Object,
        require:true
    },
    
    ratings:{
        type:Array,
        default:[]
    },
    status:{
        type:String,
        default:'available'
    }

})

const productModel = mongoose.model('product',productSchema)
module.exports = productModel