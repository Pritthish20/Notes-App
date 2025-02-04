import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from "cors";



//flies
import connectDB from './config/db.js';
import authRoute from './routes/authRoutes.js'
import notesRoute from './routes/notesRoutes.js'
import imageRoute from './routes/imageRoutes.js'
import audioRoute from './routes/audioRoutes.js'


//configuration
dotenv.config();
connectDB();

const app=express();



//middleware

app.use(cors({
  origin: ["http://localhost:5173"], 
  credentials: true,
}));
 

app.use(express.json());
app.use(express.urlencoded({ extended:true }));
app.use(cookieParser());


app.get("/", (req, res) => {
  res.send("server is up!!!");
});



const port=process.env.PORT || 3000;
//console.log(process.env.PORT);

//routes

app.use("/api/v1/auth",authRoute);
app.use("/api/v1/notes",notesRoute);
app.use("/api/v1/image",imageRoute);
app.use("/api/v1/audio",audioRoute);






app.listen(port,()=>console.log(`server listening on port ${port}`));