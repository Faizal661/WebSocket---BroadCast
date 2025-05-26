import { useState, useEffect, useRef, useCallback } from "react";

interface WebSocketMessage {
  message: string;
  timestamp: string;
}

interface UseWebSocketResult {
  receivedMessages: WebSocketMessage[];
  sendMessage: (message: string) => void;
  isConnected: boolean;
  error: Event | null;
}

export const useWebSocket = (url: string): UseWebSocketResult => {
  const [receivedMessages, setReceivedMessages] = useState<WebSocketMessage[]>(
    []
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<Event | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
      setReceivedMessages((prev) => [
        ...prev,
        {
          message: "Connected to server! 🎉🎉🎉",
          timestamp: new Date().toISOString(),
        },
      ]);
      setError(null); // Clear any previous errors
    };

    ws.current.onmessage = (event) => {
      console.log("Raw message from server:", event.data);
      try {
        const parsedMessage: WebSocketMessage = JSON.parse(event.data);
        setReceivedMessages((prev) => [...prev, parsedMessage]);
      } catch (e) {
        console.error("Failed to parse message as JSON:", e, event.data);
        setReceivedMessages((prev) => [
          ...prev,
          { message: String(event.data), timestamp: new Date().toISOString() },
        ]);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
      setReceivedMessages((prev) => [
        ...prev,
        {
          message: "Disconnected from server. 🚫🚫🚫",
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    ws.current.onerror = (event: Event) => {
      const errorEvent = event as ErrorEvent;
      console.error("WebSocket error:", errorEvent);
      setError(errorEvent);
      setReceivedMessages((prev) => [
        ...prev,
        {
          message: `WebSocket Error: ❌❌❌ ${
            errorEvent.message || "Unknown error"
          }`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, [url]);

  const sendMessage = useCallback(
    (message: string) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(message);
      } else {
        setReceivedMessages((prev) => [
          ...prev,
          {
            message: "Cannot send: WebSocket not open. ❌❌❌",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    },
    [] // No dependencies, as ws.current is a ref and its value is stable
  );

  return { receivedMessages, sendMessage, isConnected, error };
};