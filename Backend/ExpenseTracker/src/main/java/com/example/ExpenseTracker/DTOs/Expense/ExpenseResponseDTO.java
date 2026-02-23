package com.example.ExpenseTracker.DTOs.Expense;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ExpenseResponseDTO {
    Long id;
    String title;
    Long userId;
    String transactionType;
    LocalDateTime date;
    BigDecimal amount;
}
