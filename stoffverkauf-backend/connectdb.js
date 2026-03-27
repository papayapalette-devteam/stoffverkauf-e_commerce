const mongoose=require('mongoose');
const seed = require('./seed_content');

require('dotenv').config()

const connect=()=>
    {
        try {
            const resp=mongoose.connect(process.env.URL)
            console.log('database connect successfully');
            seed()
        } 
        catch (error)
         {
            console.log(error);
        }
    }
    module.exports= connect;