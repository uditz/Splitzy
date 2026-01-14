package com.example.ExpenseTracker.DTOs.Expense;

import com.example.ExpenseTracker.DTOs.ExpenseParticipantDto;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ExpenseCreationDto {
    private String title;
    private BigDecimal totalAmount;
    private List<ExpenseParticipantDto>selectedFriend;
}
