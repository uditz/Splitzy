package com.example.ExpenseTracker.repository;

import com.example.ExpenseTracker.entity.Friendship;
import com.example.ExpenseTracker.Enums.FriendshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRepository extends JpaRepository<Friendship,Long> {

    List<Friendship> findByRequesterIdAndStatus(Long requesterId, FriendshipStatus status);

    List<Friendship> findByAccepterIdAndStatus(Long accepterId, FriendshipStatus status);

    Optional<Friendship> findByAccepterIdAndRequesterIdAndStatus(Long accepterId, Long requesterId, FriendshipStatus status);

    // Optional: prevent duplicate requests
    boolean existsByRequesterIdAndAccepterId(Long requesterId, Long accepterId);
}
