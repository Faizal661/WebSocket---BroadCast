import { useState, useEffect, useRef } from "react";
import "../styles/App.css"; 
import { useWebSocket } from "../hooks/useWebSocket"; // Import the custom hook
import { formatTimestamp } from "../utils/formatTimestamp";


function App() {
  const [message, setMessage] = useState<string>(""); // Message to send
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for the message container

  // Use the custom WebSocket hook
  const { receivedMessages, sendMessage: sendWsMessage } = useWebSocket(
    "ws://localhost:8080"
  );

  // useEffect to scroll to the bottom when new messages are received
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [receivedMessages]);

  // Function to send a message to the server
  const handleSendMessage = () => {
    if (message.trim() !== "") {
      sendWsMessage(message);
      setMessage("");
    }
  };



  return (
    <div className="app-container">
      <div className="chat-container">
        <h2 className="chat-heading">WebSocket</h2>

        <div className="input-send-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            placeholder="Type your message..."
            className="message-input"
          />
          <button onClick={handleSendMessage} className="send-button">
            Send
          </button>
        </div>

        <div ref={messagesEndRef} className="messages-display">
          {receivedMessages.map((msg, index) => (
            <p
              key={index}
              className={`message-item ${
                index === receivedMessages.length - 1 ? "highlight" : ""
              }`}
            >
              <span className="message-content">{msg.message}</span>
              <span className="message-timestamp">
                {formatTimestamp(msg.timestamp)}
              </span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;