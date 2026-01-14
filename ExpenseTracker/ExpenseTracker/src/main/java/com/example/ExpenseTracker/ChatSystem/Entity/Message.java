package com.example.ExpenseTracker.ChatSystem.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue
    private Long id;

    private Long senderId;
    private Long receiverId;

    @ManyToOne
    private Conversation conversation;
    @Column(nullable = false)
    private String content;
    @Column(nullable = false)
    private LocalDateTime sentAt;
    @Column(name = "read_at", nullable = true)
    private LocalDateTime readAt; // ✅ READ RECEIPT
}

