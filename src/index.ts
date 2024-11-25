import express from "express";
import createRouter, { router } from "express-file-routing";
import morgan from "morgan";

const app = express();

async function startServer() {
    app.use(morgan("combined"));
    await createRouter(app);
    app.use("/public/", express.static("public"));

    app.use("*", (req: express.Request, res: express.Response) => {
        res.sendFile("index.html", { root: "public" });
    });

    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });
}

startServer();
