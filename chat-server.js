import { createServer } from "node:net";
import chalk from "chalk";
import sendHistory, { logHistoryMessage, logMessage } from "./chat-history.js"

import logToFile from "./logs.js";

const clients = new Map();

function getTimestamp() {
    const now = new Date();
    return chalk.yellow(`[${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]`);
}

function broadcast(message, exceptSocket = null) {
    for (const [sock] of clients) {
        if (sock !== exceptSocket) {
            sock.write(message);
        }
    }
}

const server = createServer((socket) => {
    logToFile("A user has connected");

    let username = null;

    socket.on("data", (data) => {
        const message = data.toString("utf-8").trim();

        console.log(message);
        logToFile(`Message: ${message}`);

        if (!username && message.startsWith("__REGISTER__:")) {
            username = message.split(":")[1];
            clients.set(socket, username);

            const joinMsg = `[SYSTEM]${getTimestamp()} ${username} se ha conectado.`;
            console.log(joinMsg);
            broadcast(joinMsg, socket);
            readMessagesHistory(joinMsg);
            return;
        }

        if (message.startsWith("__CMD__:")) {
            const [_, cmd, ...args] = message.split(":");

            switch (cmd) {
                case "LIST": {
                    const names = Array.from(clients.values()).join(", ");
                    socket.write(`[SYSTEM] Usuarios conectados: ${names}\n`);
                    break;
                }
                case "RENAME": {
                    const old = username;
                    username = args[0];
                    clients.set(socket, username);
                    const renameMsg = `[SYSTEM]${getTimestamp()} ${old} ahora es ${username}`;
                    broadcast(renameMsg);
                    break;
                }
                case "WHISPER": {
                    const targetName = args[0];
                    const msg = args.slice(1).join(":");
                    const targetSocket = [...clients.entries()].find(([_, name]) => name === targetName)?.[0];

                    if (targetSocket) {
                        const fullMsg = `[WHISPER to ${targetName}]${getTimestamp()} ${username}: ${msg}`;
                        targetSocket.write(fullMsg + "\n");
                        socket.write(`[WHISPER to ${targetName}]${getTimestamp()} ${username}: ${msg}\n`);
                    } else {
                        socket.write(`[SYSTEM] Usuario "${targetName}" no encontrado.\n`);
                    }
                    break;
                }
                case "HISTORY": {
                    socket.write('Historial reciente:\n');
                    sendHistory(socket);
                }
            }
            return;
        }

        const fullMessage = `${getTimestamp()} ${message}`;
        broadcast(fullMessage, socket);
        logMessage(fullMessage);
        logHistoryMessage(fullMessage);
        process.stdout.write(fullMessage + "\n");
    });

    socket.on("end", () => {
        if (username) {
            const leaveMsg = `[SYSTEM]${getTimestamp()} ${username} ha salido del chat.`;
            console.log(leaveMsg);
            broadcast(leaveMsg, socket);
            clients.delete(socket);
            logToFile("A user has disconnected");
        }
    });

    socket.on("error", (err) => {
        console.log("Socket error:", err.message);
        clients.delete(socket);
        logToFile(`Socket error: ${err.message}`);
    });
});



server.listen(3000, () => {
    console.log("🚀 Chat server running on port 3000");
});