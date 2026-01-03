import express from "express";
import http from "http";
import WebSocket from "ws";
import cors from "cors"; 
import path from 'path';

const app = express();
const port = 8080;

app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

// new client connects to the WebSocket server
wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected ");

  const welcomeMessage = {
    message: "Welcome to the BroadCast!  ✅✅✅",
    timestamp: new Date().toISOString(),
  };
  ws.send(JSON.stringify(welcomeMessage));

  // message from user
  ws.on("message", (message: WebSocket.Data) => {
    const messageString = message.toString(); 
    console.log(`Received message: ${messageString}`);

    const messageToSend = {
      message: messageString,
      timestamp: new Date().toISOString(),
    };
    
    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(messageToSend));
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.on("error", (error: Error) => {
    console.error("WebSocket error:", error);
  });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dist/index.html'));
});

server.listen(port, () => {
  console.log(`HTTP server listening on http://localhost:${port}`);
  console.log(`WebSocket server listening on ws://localhost:${port}`);
});
