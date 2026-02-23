package com.example.ExpenseTracker.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name="expense_participants")
public class ExpenseParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "expense_id")
    private Long expenseId;  // Store the expenseId as a foreign key

    @Column(name = "user_id", nullable = false)
    private Long userId;  // Store the userId as a foreign key

    private Long ownerId;

    private BigDecimal amountOwed; //the amount on this friend
    private String transactionType; // owed, paid etc.

}
