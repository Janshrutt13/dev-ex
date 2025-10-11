const dotenv = require("dotenv")
const cors = require("cors")
const express = require("express")
const mongoose = require("mongoose")
const authRoutes = require("./routes/auth.routes")

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5000;

//MIDDLEWARES
app.use(cors())
app.use(express.json())

const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri)
.then(() => console.log("MongoDB connected"))
.catch((err : any) => console.log(err))


//ROUTES
app.get("/" , (req : any,res : any) => {
    res.json({ message : "Welcome to Dev-Ex!"})
});

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});
