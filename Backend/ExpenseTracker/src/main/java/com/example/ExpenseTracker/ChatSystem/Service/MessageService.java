package com.example.ExpenseTracker.ChatSystem.Service;

import com.example.ExpenseTracker.ChatSystem.Entity.Conversation;
import com.example.ExpenseTracker.ChatSystem.Entity.Message;
import com.example.ExpenseTracker.ChatSystem.Repository.MessageRepository;
import com.example.ExpenseTracker.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

        @Autowired
        private MessageRepository messageRepository;

        @Autowired
        public UserService userService;

        @Autowired
        private ConversationService conversationService;

        public Message sendMessage(String senderUsername, Long conversationId,
                        Long receiverId, String content) {

                Long senderId = userService.findUserIdByUsername(senderUsername).orElseThrow(() -> new RuntimeException("User not found"));

                Conversation conversation = conversationService.getOrCreateConversation(
                                senderId, receiverId);

                Message msg = new Message();
                msg.setSenderId(senderId);
                msg.setReceiverId(receiverId);
                msg.setConversation(conversation);
                msg.setContent(content);
                msg.setSentAt(LocalDateTime.now());
                msg.setReadAt(null);

                return messageRepository.save(msg);
        }

        public List<Message> getChatHistory(Long conversationId) {
                return messageRepository
                                .findByConversationIdOrderBySentAtAsc(conversationId);
        }
}
