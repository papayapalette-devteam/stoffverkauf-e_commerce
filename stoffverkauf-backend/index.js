
const express=require('express')
const cors=require('cors');
const path = require('path');
const connect = require('./connectdb');
const bodyParser = require('body-parser');
require('dotenv').config();


const app=express();

// app.use(bodyParser.json())
// Increase request body size limit
app.use(bodyParser.json({ limit: "50mb" })); // Increase limit for JSON payloads
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); // Increase limit for form data
// Allow up to 50MB of JSON data (adjust as needed)
app.use(express.json({ limit: '50mb' }));

// app.use('/images', express.static('images'));
app.use('/images', express.static(path.join(__dirname, 'images')));
// app.use(cors())

/* ---------- CORS (VERY IMPORTANT ORDER) ---------- */
const corsOptions = {
  origin: [
    "https://admin.made4ever.in",
    "https://stoffverkauf-e-commerce-w7li.vercel.app/",
    "http://localhost:8080",
    "http://localhost:3000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); 

connect();
app.get('/',(req,res)=>
{
    res.send("welcome to stoffverkauf")
})

// ===============================================
//          all routesm start
// ===============================================


app.use('/api/upload',require('./Routes/uploadfiles'));

app.use('/api/products',require('./Routes/add_product'));

app.use('/api/category',require('./Routes/category'));





// ===============================================
//          all routes end
// ===============================================


const server=app.listen(process.env.PORT,()=>
{
    console.log(`server is running on port:${process.env.PORT}`);
})
server.setTimeout(5 * 60 * 1000); // 300000 ms = 5 minutes

