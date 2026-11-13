import dotenv from "dotenv";
import connectDB from "./db/index.js";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
.then(() => {

    app.on("error", (error) =>{
        console.log("ERROR:", error);
        throw error 
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port  ${process.env.PORT}`)
    } )
})
.catch( (error) => {
    console.log("MongoDB Connection failed !! : ", error)
})























/*
import express from 'express'

const app = express();

(
async () => {
    try{

    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
                console.log("ERROR : ", error);
                throw error;
            }
          )
    app.listen(process.env.PORT, () =>{
        console.log(`App is listening on port ${process.env.PORT}`)
        })
    }
    catch(error){
    console.error("ERROR:", error)
    }
    
})() //=> iffe (Immediately Invoked Function Expression).
 */
