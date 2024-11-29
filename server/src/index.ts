import express, { NextFunction, Request, Response } from "express";
import createRouter, { router } from "express-file-routing";
import morgan from "morgan";

const app = express();

async function startServer() {
    app.use(morgan("combined"));
    app.use(express.json());
    app.use(
        "/",
        (await router({
            routerOptions: {
                strict: true,
                caseSensitive: true,
                mergeParams: true,
            },
        })) as any
    );
    app.use("/public/", express.static("../public"));
    // Custom error handler
    app.use("*", (req: express.Request, res: express.Response) => {
        res.sendFile("index.html", { root: "../public" });
    });
    app.use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(err.stack);
        res.status(500).send("Internal Server Error");
    });
    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });
}

startServer();
