//db connections

const mongoose = require('mongoose');
const dotenv= require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
.then(resp=>console.log('connected'))
.catch(err=>console.log('error occured',err))