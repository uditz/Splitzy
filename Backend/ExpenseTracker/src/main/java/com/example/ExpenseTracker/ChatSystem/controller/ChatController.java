package com.example.ExpenseTracker.ChatSystem.controller;

import com.example.ExpenseTracker.ChatSystem.Entity.Conversation;
import com.example.ExpenseTracker.ChatSystem.Service.ConversationService;
import com.example.ExpenseTracker.ChatSystem.Entity.Message;
import com.example.ExpenseTracker.ChatSystem.Service.MessageService;
import com.example.ExpenseTracker.DTOs.ConversationResponseDto;
import com.example.ExpenseTracker.DTOs.MessageSendDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private ConversationService conversationService;

    @GetMapping("/conversation/{friendId}")
    public Long getConversationId(@PathVariable Long friendId) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        // userId fetch inside service
        Conversation conversation = conversationService.getOrCreateConversation(
                messageService.userService.findUserIdByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found")),
                friendId);

        return conversation.getId();
    }

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/send")
    public Message sendMessage(@RequestBody MessageSendDto dto) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String senderUsername = auth.getName();

        Message savedMessage = messageService.sendMessage(
                senderUsername,
                dto.getConversationId(),
                dto.getReceiverId(),
                dto.getContent());

        // Broadcast to WebSocket topic so connected clients see it instantly
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + dto.getConversationId(),
                savedMessage);

        return savedMessage;
    }

    @GetMapping("/history/{conversationId}")
    public List<Message> getChatHistory(@PathVariable Long conversationId) {
        return messageService.getChatHistory(conversationId);
    }

    @GetMapping("/getConversations")
    public List<ConversationResponseDto> getConversations() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return conversationService.getConversations(username);
    }

}
