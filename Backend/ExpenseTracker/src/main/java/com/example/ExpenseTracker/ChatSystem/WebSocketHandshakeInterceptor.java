package com.example.ExpenseTracker.ChatSystem;


import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.example.ExpenseTracker.security.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.Map;

@Component
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;

    public WebSocketHandshakeInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) throws Exception {

        System.out.println("🔵 [WebSocket] beforeHandshake called");

        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpRequest = servletRequest.getServletRequest();

            // Extract token from query parameter
            String token = httpRequest.getParameter("token");
            System.out.println("🔍 [WebSocket] Token from query: " + (token != null ? "Present (length: " + token.length() + ")" : "NULL"));

            if (token != null && !token.isEmpty()) {
                try {
                    // Validate token
                    if (jwtUtil.validateToken(token)) {
                        String username = jwtUtil.extractUsername(token);
                        System.out.println("✅ [WebSocket] Token valid for user: " + username);

                        // Create authentication object
                        Authentication auth = new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                        );

                        // Store authentication in WebSocket session attributes
                        attributes.put("user", auth);
                        attributes.put("username", username);
                        
                        System.out.println("✅ [WebSocket] Authentication stored in session attributes");
                        return true;
                    } else {
                        System.err.println("❌ [WebSocket] Token validation failed");
                    }
                } catch (Exception e) {
                    System.err.println("❌ [WebSocket] Token validation exception: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.err.println("❌ [WebSocket] No token provided in query parameter");
            }
        }

        System.err.println("⚠️ [WebSocket] Handshake proceeding without authentication");
        // Allow connection even without auth for debugging
        // In production, you might want to return false here
        return true;
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception
    ) {
        if (exception != null) {
            System.err.println("❌ [WebSocket] afterHandshake exception: " + exception.getMessage());
        } else {
            System.out.println("✅ [WebSocket] afterHandshake completed successfully");
        }
    }
}