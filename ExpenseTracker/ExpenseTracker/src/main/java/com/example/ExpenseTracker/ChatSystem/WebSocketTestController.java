package com.example.ExpenseTracker.ChatSystem;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Test controller to verify WebSocket connectivity
 * Remove this file after testing is complete
 */
@RestController
public class WebSocketTestController{

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketTestController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * REST endpoint to test broadcasting a message to a conversation
     * Call this from your browser or Postman to test if WebSocket is working
     * 
     * Example: GET http://192.168.1.12:8080/test/broadcast/5
     */
    @GetMapping("/test/broadcast/{conversationId}")
    public Map<String, Object> testBroadcast(@PathVariable Long conversationId) {
        Map<String, Object> testMessage = new HashMap<>();
        testMessage.put("id", 99999L);
        testMessage.put("content", "🧪 Test message at " + LocalDateTime.now());
        testMessage.put("senderId", 1L);
        testMessage.put("timestamp", LocalDateTime.now().toString());
        testMessage.put("isTest", true);

        String destination = "/topic/conversation/" + conversationId;
        System.out.println("📤 [TEST] Broadcasting test message to: " + destination);
        
        messagingTemplate.convertAndSend(destination, testMessage);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Test message broadcast to conversation " + conversationId);
        response.put("destination", destination);
        response.put("testMessage", testMessage);
        
        System.out.println("✅ [TEST] Test message sent successfully");
        return response;
    }

    /**
     * WebSocket message handler
     * This demonstrates receiving messages from clients via /app/test
     */
    @MessageMapping("/test")
    @SendTo("/topic/test")
    public Map<String, Object> handleTestMessage(Map<String, Object> message, Principal principal) {
        System.out.println("📨 [TEST] Received test message from: " + 
            (principal != null ? principal.getName() : "anonymous"));
        
        Map<String, Object> response = new HashMap<>();
        response.put("received", message);
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("user", principal != null ? principal.getName() : "anonymous");
        
        return response;
    }
}
