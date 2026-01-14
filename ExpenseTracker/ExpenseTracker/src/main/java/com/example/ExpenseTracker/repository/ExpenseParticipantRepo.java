package com.example.ExpenseTracker.repository;

import com.example.ExpenseTracker.entity.ExpenseParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseParticipantRepo extends JpaRepository<ExpenseParticipant, Long> {
    // Find all participants of a specific expense
    List<ExpenseParticipant> findByExpenseId(Long expenseId);

    // Find all participants for a specific user (either debtor or creditor)
    List<ExpenseParticipant> findByUserId(Long userId);

    // Find participants by expense ID and transaction type (for example, "OWED")
    List<ExpenseParticipant> findByExpenseIdAndTransactionType(Long expenseId, String transactionType);

}
