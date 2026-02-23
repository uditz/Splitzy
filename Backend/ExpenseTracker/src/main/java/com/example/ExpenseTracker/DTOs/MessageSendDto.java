package com.example.ExpenseTracker.DTOs;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class MessageSendDto {
    private Long receiverId;
    private String content;
    private Long conversationId;
}
