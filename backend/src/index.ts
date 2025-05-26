import express from "express";
import http from "http";
import WebSocket from "ws"; // WebSocket library
import cors from "cors"; // For handling Cross-Origin Resource Sharing
import path from 'path';

const app = express();
const port = 8080;

app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

const server = http.createServer(app);

// Initialize WebSocket server by passing the HTTP server
const wss = new WebSocket.Server({ server });

// --- WebSocket Logic ---
// This event fires when a new client connects to the WebSocket server
wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected ");

  // Send a welcome message to the newly connected client
  const welcomeMessage = {
    message: "Welcome to the WebSocket server!  ✅✅✅",
    timestamp: new Date().toISOString(),
  };
  ws.send(JSON.stringify(welcomeMessage));

  // This event fires when the server receives a message from a client
  ws.on("message", (message: WebSocket.Data) => {
    const messageString = message.toString(); // Convert Buffer to string
    console.log(`Received message: ${messageString}`);

    const messageToSend = {
      message: messageString,
      timestamp: new Date().toISOString(),
    };
    
    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      // Ensure client is ready to receive messages (WebSocket.OPEN = 1)
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(messageToSend));
      }
    });
  });

  // This event fires when a client closes their connection
  ws.on("close", () => {
    console.log("Client disconnected");
  });

  // This event fires if there's an error with the WebSocket connection
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
