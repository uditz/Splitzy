package com.example.ExpenseTracker.ChatSystem.controller;

import com.example.ExpenseTracker.ChatSystem.Entity.Message;
import com.example.ExpenseTracker.ChatSystem.Service.MessageService;
import com.example.ExpenseTracker.DTOs.MessageSendDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatSocketController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/send")
    public void sendMessage(@Payload MessageSendDto dto, Principal principal) {
        System.out.println("📨 @MessageMapping called");
        System.out.println("   Principal received: " + (principal != null ? principal.getName() : "NULL"));
        if (principal != null) {
            System.out.println("   Principal class: " + principal.getClass().getName());
        }
        // Save message in DB
        Message savedMessage = messageService.sendMessage(
                principal.getName(),
                dto.getConversationId(),
                dto.getReceiverId(),
                dto.getContent()
        );

        // Send to conversation topic
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + dto.getConversationId(),
                savedMessage
        );
    }
}
