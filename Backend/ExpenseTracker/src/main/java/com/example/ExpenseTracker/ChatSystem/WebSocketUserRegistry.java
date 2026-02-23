package com.example.ExpenseTracker.ChatSystem;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketUserRegistry {
    private static final Map<String, Authentication> userMap = new ConcurrentHashMap<>();

    public static void put(String sessionId, Authentication auth) {
        userMap.put(sessionId, auth);
    }

    public static Authentication get(String sessionId) {
        return userMap.get(sessionId);
    }

    public static void remove(String sessionId) {
        userMap.remove(sessionId);
    }
}