package com.example.ExpenseTracker.ChatSystem.Repository;

import com.example.ExpenseTracker.ChatSystem.Entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByUser1IdAndUser2Id(Long user1Id, Long user2Id);

    List<Conversation> findByUser1IdOrUser2Id(Long user1Id, Long user2Id);
}
