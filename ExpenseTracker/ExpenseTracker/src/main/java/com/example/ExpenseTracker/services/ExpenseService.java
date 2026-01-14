package com.example.ExpenseTracker.services;

import com.example.ExpenseTracker.DTOs.Expense.ExpenseCreationDto;
import com.example.ExpenseTracker.DTOs.ExpenseParticipantDto;
import com.example.ExpenseTracker.entity.Expense;
import com.example.ExpenseTracker.entity.ExpenseParticipant;
import com.example.ExpenseTracker.entity.User;
import com.example.ExpenseTracker.repository.ExpenseParticipantRepo;
import com.example.ExpenseTracker.repository.ExpenseRepository;
import com.example.ExpenseTracker.repository.FriendRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.ExpenseTracker.repository.NotificationRepo;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import com.example.ExpenseTracker.entity.Notification;
@Service
public class ExpenseService {
    @Autowired
    ExpenseRepository expenseRepository;
    @Autowired
    UserService userService;

    @Autowired
    FriendRepository friendRepository;

    @Autowired
    ExpenseParticipantRepo expenseParticipantRepo;

    @Autowired
    NotificationRepo notificationRepo;

    public boolean addExpense(String username, ExpenseCreationDto reqDto) {

        Long userId = userService.findUserIdByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Step 1: Save expense first → so expenseId is generated
        Expense expense = new Expense();
        expense.setAmount(reqDto.getTotalAmount());
        expense.setTransactionType("OWE");
        expense.setTitle(reqDto.getTitle());
        expense.setUserId(userId);
        expense.setDate(LocalDateTime.now());
        expenseRepository.save(expense);

        Long expenseId = expense.getId(); // VERY IMPORTANT

        // Step 2: Prepare participant list
        List<ExpenseParticipant> participants = new ArrayList<>();

        for (ExpenseParticipantDto dto : reqDto.getSelectedFriend()) {

            User friend = userService.findByUsername(dto.getName());
            Notification notification = new Notification();
            notification.setUserId(friend.getId());
            notification.setMessage(username + " invited you to an expense of " 
                                                    + reqDto.getTitle() + " with amount " + reqDto.getTotalAmount());
            notification.setType("EXPENSE");
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepo.save(notification);
            ExpenseParticipant p = new ExpenseParticipant();
            p.setExpenseId(expenseId); // Set FK as Long only
            p.setUserId(friend.getId());
            p.setAmountOwed(dto.getAmount());
            p.setTransactionType("OWED");
            p.setOwnerId(userId);

            participants.add(p);
        }

        // Step 3: Save all participants in one go (better performance)
        expenseParticipantRepo.saveAll(participants);

        // Step 4: Link participants in expense object (not required for DB, but good
        // for returning data)

        return true;
    }

    public List<Expense> getAllExpense() {
        return expenseRepository.findAll();
    }

    public List<Expense> getExpensesByUserId(Long targetId) {
        if (userService.findUserById(targetId) == null) {
            return new ArrayList<Expense>();
        }
        return expenseRepository.findByUserId(targetId);

    }

    public ExpenseParticipant setingPaidExpense(String ownername, Long receiverId, Long expenseId) {
        Long ownerId = userService.findUserIdByUsername(ownername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ExpenseParticipant ans = new ExpenseParticipant();
        List<ExpenseParticipant> exp = expenseParticipantRepo.findByExpenseIdAndTransactionType(expenseId, "OWED");
        for (ExpenseParticipant i : exp) {
            if (i.getOwnerId().equals(ownerId) && i.getUserId().equals(receiverId)) {
                i.setTransactionType("DONE");
                ans = i;
                if(exp.size()==1){
                    expenseRepository.delete(expenseRepository.findById(expenseId).get());
                }
                expenseParticipantRepo.delete(i);
                break;
            }
        }
        return ans;

    }

    public Expense findExpenseByExpenseId(Long expenseId) {
        return expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + expenseId));

    }

    public void deleteExpense(Long expenseId){
        expenseRepository.delete(expenseRepository.findById(expenseId).get());
    }
}
