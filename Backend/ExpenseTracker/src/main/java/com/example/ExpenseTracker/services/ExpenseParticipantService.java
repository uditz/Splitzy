package com.example.ExpenseTracker.services;

import com.example.ExpenseTracker.entity.ExpenseParticipant;
import com.example.ExpenseTracker.entity.User;
import com.example.ExpenseTracker.repository.ExpenseParticipantRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service

public class ExpenseParticipantService {
    @Autowired
    ExpenseParticipantRepo expenseParticipantRepo;

    @Autowired
    UserService userService;

    public List<ExpenseParticipant> getAllOwedExpense(String username) {
        Long userId = userService.findUserIdByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return expenseParticipantRepo.findByUserId(userId);

    }

    public List<ExpenseParticipant> findByExpenseId(Long expenseId) {
        return expenseParticipantRepo.findByExpenseId(expenseId);
    }

}
