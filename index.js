
import { connectDB } from "./db/connectDB.js";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(cors({origin:'*'}));
app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:'16kb'}));
app.use(cookieParser());
connectDB();
//routes import
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users",userRouter)
app.use(cors({origin:'*'}))

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
});
