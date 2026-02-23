package com.example.ExpenseTracker.DTOs;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConversationResponseDto {
    private Long conversationId;
    private Long friendId;
    private String friendName;
    private String friendImageUrl;
}
