import { appendFileSync, mkdirSync, existsSync } from "node:fs";
import { format } from "date-fns";

const logDir = "logs";
if (!existsSync(logDir)) mkdirSync(logDir);

function logToFile(content) {
    const date = format(new Date(), "yyyy-MM-dd");
    const timestamp = new Date().toISOString();
    const filePath = `${logDir}/${date}.log`;
    appendFileSync(filePath, `[${timestamp}] ${content}\n`);
}

export default logToFile;