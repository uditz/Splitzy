// src/services/socket.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

export const connectToWebSocket = (conversationId, onMessageReceived) => {
  const token = localStorage.getItem("token");

  // ✅ JWT AS QUERY PARAM
  const socket = new SockJS(
    `http://localhost:8080/ws?token=${token}`
  );

  stompClient = new Client({
    webSocketFactory: () => socket,

    // ❌ REMOVE connectHeaders
    connectHeaders: {},

    onConnect: () => {
      console.log("✅ WebSocket Connected Successfully");

      stompClient.subscribe(
        `/topic/conversation/${conversationId}`,
        (msg) => {
          const received = JSON.parse(msg.body);
          console.log("📩 Received message:", received);
          onMessageReceived(received);
        }
      );
    },

    onStompError: (frame) => {
      console.error("❌ STOMP error:", frame);
    },

    onWebSocketError: (error) => {
      console.error("❌ WebSocket error:", error);
    },

    onWebSocketClose: (event) => {
      console.log("❌ WebSocket closed:", event);
    },

    debug: (str) => {
      console.log("STOMP:", str);
    }
  });

  stompClient.activate();
};

export const sendMessage = (conversationId, friendId, content) => {
  if (!stompClient || !stompClient.connected) {
    console.warn("⚠ WebSocket not connected yet!");
    return;
  }

  stompClient.publish({
    destination: "/app/chat/send",
    body: JSON.stringify({
      conversationId,
      receiverId: friendId,
      content
    })
  });
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    console.log("❌ WebSocket Disconnected");
  }
};
