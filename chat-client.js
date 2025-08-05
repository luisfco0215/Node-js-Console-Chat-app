import { createConnection } from "node:net";
import { createInterface } from "readline/promises";
import chalk from "chalk";

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

let username = await rl.question(chalk.cyan("Choose a username: "));

const socket = createConnection({ port: 3000 }, async () => {
    console.log(chalk.green("✅ Connected to the chat server"));

    socket.write(`__REGISTER__:${username}`);

    rl.on("line", (input) => {

        if (input === "/exit") {
            socket.end();
            rl.close();
            return;
        }

        if (input === "/list") {
            socket.write(`__CMD__:LIST`);
            return;
        }

        if (input.startsWith("/name ")) {
            const newName = input.split(" ")[1];
            username = newName;
            socket.write(`__CMD__:RENAME:${newName}`);
            return;
        }

        if (input.startsWith("/w ")) {
            const [_, target, ...msgParts] = input.split(" ");
            const msg = msgParts.join(" ");
            socket.write(`__CMD__:WHISPER:${target}:${msg}`);
            return;
        }

        socket.write(`${username}: ${input}`);
    });
});

socket.on("data", (data) => {
    const message = data.toString("utf-8");

    if (message.startsWith(`${username}:`)) {
        console.log(chalk.yellowBright(message));
    } else if (message.startsWith("[SYSTEM]")) {
        console.log(chalk.green(message));
    } else {
        console.log(chalk.blue(message));
    }
});

socket.on("close", () => {
    console.log("❌ Disconnected from server");
    rl.close();
});

socket.on("error", (err) => {
    console.log("⚠️ Connection error:", err.message);
    rl.close();
});