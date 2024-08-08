import express from "express"
import 'dotenv/config'


const app = express()

app.get("/", (req, res) => {
    res.send("Hello my first server")
})

app.listen(process.env.PORT, () => {
    console.log("Server is listening on port 4000");

})

