package com.example.ExpenseTracker.security;

public record JwtResponse(String token, Long userId, String username, String imageUrl) {
}
