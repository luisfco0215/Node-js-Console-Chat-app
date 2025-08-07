import { appendFile, readFileSync } from "node:fs";
import logToFile from "./logs.js";


const messageHistory = [];

export function logMessage(msg) {
  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] Message: ${msg}`;
  console.log(formatted);
  messageHistory.push(formatted);
}

export default function sendHistory(socket) {
  const recentMessages = messageHistory.slice(-10);
  recentMessages.forEach(line => {
    socket.write(line + '\n');
  });
}

export function logHistoryMessage(content) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${content}\n`;

  appendFile("./chat-history/chat-history.txt", line, (err) => {
    if (err) logToFile(err);
  });
}

export function readMessagesHistory(socket) {
  try {
    const result = readFileSync("./chat-history/chat-history.txt", "utf-8");
    socket.write(JSON.parse(result));
  } catch (error) {
    if (err) logToFile(err);
  }
}