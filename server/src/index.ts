import express, { NextFunction, Request, Response } from "express";
import createRouter, { router } from "express-file-routing";
import morgan from "morgan";
import { log } from "./utils/debug";
import { config } from "dotenv";
config();
const app = express();

const isDev = process.env.NODE_ENV === "development";

function checkEnv() {
    if (!process.env.SURICATA_CONFIG) {
        log("warning", "SURICATA_CONFIG not set, using default");
    }
    if (!process.env.SURICATA_EVE) {
        log("warning", "SURICATA_EVE not set, reading from suricata.yaml");
    }
    if (!process.env.MONGO_URI) {
        log("warning", "MONGO_URI not set, using default");
    }
    if (!process.env.MAX_LOGS) {
        log("warning", "MAX_LOGS not set, using default");
    }
    if (isDev) {
        log("info", "Running in development mode");
    }
}

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

    app.use("*", (req: express.Request, res: express.Response) => {
        res.sendFile("index.html", { root: "../public" });
    });

    app.use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
        let message = isDev ? err.message : "Internal Server Error";
        log("error", err.message);
        isDev && console.error(err);
        res.status(500).send(message);
    });
    app.listen(3000, () => {
        log("info", "Server started on port 3000");
    });
}
checkEnv();
startServer();
