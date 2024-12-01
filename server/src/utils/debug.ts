import colors from "colors";

const PLAIN_TEXT = process.env.PLAIN_TEXT === "true";

function getTimeStamp(): string {
    return new Date().toISOString();
}

type LogLevel = "info" | "warning" | "error" | "debug" | "trace";

// Log function that logs to console
// This is the most important function in the whole of the project
function log(level: LogLevel, message: string, ...args: string[]): void {
    const timeStamp = getTimeStamp();
    let logFunction;
    let colorFunction;

    switch (level) {
        case "info":
            logFunction = console.info;
            colorFunction = colors.blue;
            break;
        case "warning":
            logFunction = console.warn;
            colorFunction = colors.yellow;
            break;
        case "error":
            logFunction = console.error;
            colorFunction = colors.red;
            break;
        case "debug":
            logFunction = console.debug;
            colorFunction = colors.green;
            break;
        case "trace":
            logFunction = console.trace;
            colorFunction = colors.magenta;
            break;
        default:
            logFunction = console.log;
            colorFunction = colors.white;
    }
    if (PLAIN_TEXT) {
        logFunction(`[${level.toUpperCase()}] [${timeStamp}]: ${message}`, args);
        return;
    }
    logFunction(colorFunction(`[${level.toUpperCase()}] [${timeStamp}]: ${message}`));
}

export function logObject(obj: any): void {
    console.dir(obj, { depth: null, colors: true });
}

export { log };
