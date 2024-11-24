import express from "express";
import createRouter, { router } from "express-file-routing";

const app = express();

async function startServer() {
    app.use("/", await router());
    app.use("/public/", express.static("public"));

    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });
}

startServer();
