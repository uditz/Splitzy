package com.example.ExpenseTracker.ChatSystem;



import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null) {
            StompCommand command = accessor.getCommand();
            
            // Log every command we receive
            System.out.println("🔵 [STOMP Interceptor] Received command: " + command);
            
            if (StompCommand.CONNECT.equals(command)) {
                System.out.println("🔵 [STOMP] Processing CONNECT command");
                System.out.println("🔍 [STOMP] Session attributes: " + accessor.getSessionAttributes());
                
                // Retrieve authentication from session attributes (set during handshake)
                Authentication auth = (Authentication) accessor.getSessionAttributes().get("user");

                if (auth != null) {
                    accessor.setUser(auth);
                    System.out.println("✅ [STOMP] User authenticated and set: " + auth.getName());
                    System.out.println("✅ [STOMP] User authorities: " + auth.getAuthorities());
                } else {
                    System.err.println("⚠️ [STOMP] No authentication found in session attributes for CONNECT");
                    System.err.println("⚠️ [STOMP] Available keys: " + 
                        (accessor.getSessionAttributes() != null ? accessor.getSessionAttributes().keySet() : "null"));
                }
            } else if (StompCommand.SUBSCRIBE.equals(command)) {
                String destination = accessor.getDestination();
                String user = accessor.getUser() != null ? accessor.getUser().getName() : "anonymous";
                System.out.println("📡 [STOMP] User '" + user + "' subscribing to: " + destination);
            } else if (StompCommand.SEND.equals(command)) {
                String destination = accessor.getDestination();
                String user = accessor.getUser() != null ? accessor.getUser().getName() : "anonymous";
                System.out.println("📤 [STOMP] User '" + user + "' sending to: " + destination);
            } else if (StompCommand.DISCONNECT.equals(command)) {
                String user = accessor.getUser() != null ? accessor.getUser().getName() : "anonymous";
                System.out.println("🔌 [STOMP] User '" + user + "' disconnecting");
            }
        } else {
            System.out.println("⚠️ [STOMP Interceptor] Accessor is null for message");
        }

        return message;
    }

    @Override
    public void postSend(Message<?> message, MessageChannel channel, boolean sent) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            System.out.println(sent ? 
                "✅ [STOMP] CONNECT message processed successfully" : 
                "❌ [STOMP] CONNECT message failed to process");
        }
    }

    @Override
    public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
        if (ex != null) {
            System.err.println("❌ [STOMP] Error during message send: " + ex.getMessage());
            ex.printStackTrace();
        }
    }
}