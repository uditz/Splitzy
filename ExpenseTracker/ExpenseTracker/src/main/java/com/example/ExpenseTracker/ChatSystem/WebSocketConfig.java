package com.example.ExpenseTracker.ChatSystem;


import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthInterceptor authInterceptor;
    private final WebSocketHandshakeInterceptor handshakeInterceptor;

    public WebSocketConfig(
            WebSocketAuthInterceptor authInterceptor,
            WebSocketHandshakeInterceptor handshakeInterceptor) {
        this.authInterceptor = authInterceptor;
        this.handshakeInterceptor = handshakeInterceptor;
        System.out.println("✅ [WebSocket] WebSocketConfig initialized");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        System.out.println("🔧 [WebSocket] Registering STOMP endpoints");

        // Endpoint for mobile apps (native WebSocket, no SockJS)
        // CRITICAL: Don't add any extra handlers that might interfere
        registry.addEndpoint("/ws-mobile")
                .addInterceptors(handshakeInterceptor)
                .setAllowedOriginPatterns("*");
        
        System.out.println("✅ [WebSocket] Registered /ws-mobile endpoint (native WebSocket)");

        // Endpoint for web apps (with SockJS fallback)
        registry.addEndpoint("/ws")
                .addInterceptors(handshakeInterceptor)
                .setAllowedOriginPatterns("*")
                .withSockJS();
        
        System.out.println("✅ [WebSocket] Registered /ws endpoint (SockJS)");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        System.out.println("🔧 [WebSocket] Configuring message broker");
        
        // Create a task scheduler for the message broker
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("wss-heartbeat-");
        scheduler.initialize();
        
        // Enable simple in-memory broker with heartbeat
        registry.enableSimpleBroker("/topic", "/queue")
                .setHeartbeatValue(new long[]{10000, 10000})
                .setTaskScheduler(scheduler);
        
        // Set application destination prefix
        registry.setApplicationDestinationPrefixes("/app");
        
        System.out.println("✅ [WebSocket] Message broker configured - Broker: /topic,/queue | App: /app | Heartbeat: 10s");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        System.out.println("🔧 [WebSocket] Configuring client inbound channel");
        registration.interceptors(authInterceptor);
        System.out.println("✅ [WebSocket] Auth interceptor registered on inbound channel");
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        System.out.println("🔧 [WebSocket] Configuring WebSocket transport");
        
        // Increase message size limits
        registration.setMessageSizeLimit(128 * 1024); // 128 KB
        registration.setSendBufferSizeLimit(512 * 1024); // 512 KB
        registration.setSendTimeLimit(20000); // 20 seconds
        
        System.out.println("✅ [WebSocket] Transport configured with increased limits");
    }
}