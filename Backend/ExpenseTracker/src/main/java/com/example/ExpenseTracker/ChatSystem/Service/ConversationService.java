package com.example.ExpenseTracker.ChatSystem.Service;

import com.example.ExpenseTracker.ChatSystem.Entity.Conversation;
import com.example.ExpenseTracker.ChatSystem.Repository.ConversationRepository;
import com.example.ExpenseTracker.DTOs.ConversationResponseDto;
import com.example.ExpenseTracker.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.example.ExpenseTracker.services.UserService;

@Service
public class ConversationService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private UserService userService;

    public Conversation getOrCreateConversation(Long userA, Long userB) {

        Long user1 = Math.min(userA, userB);
        Long user2 = Math.max(userA, userB);

        return conversationRepository
                .findByUser1IdAndUser2Id(user1, user2)
                .orElseGet(() -> {
                    Conversation c = new Conversation();
                    c.setUser1Id(user1);
                    c.setUser2Id(user2);
                    c.setCreatedAt(LocalDateTime.now());
                    return conversationRepository.save(c);
                });
    }

    public List<ConversationResponseDto> getConversations(String username) {
        Long currentUserId = userService.findUserIdByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Conversation> conversations = conversationRepository.findByUser1IdOrUser2Id(currentUserId, currentUserId);

        List<ConversationResponseDto> response = new ArrayList<>();

        for (Conversation c : conversations) {
            Long friendId = c.getUser1Id().equals(currentUserId) ? c.getUser2Id() : c.getUser1Id();
            User friend = userService.findUserById(friendId);

            response.add(ConversationResponseDto.builder()
                    .conversationId(c.getId())
                    .friendId(friendId)
                    .friendName(friend.getName())
                    .friendImageUrl(friend.getImageUrl())
                    .build());
        }
        return response;
    }
}
