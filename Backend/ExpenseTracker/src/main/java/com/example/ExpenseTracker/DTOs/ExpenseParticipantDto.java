package com.example.ExpenseTracker.DTOs;

import jakarta.persistence.spi.PersistenceUnitTransactionType;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
//@AllArgsConstructor
public class ExpenseParticipantDto {


    Long id;
    Long ownerId;
    Long receiverId;
    String name;
    String ownerName;
    String receiverName;
    Long expenseId;
   private BigDecimal amount;
    private String image;
    private String transactionType;
    public ExpenseParticipantDto(Long id, String name , String image){
        this.id= id;
        this.name= name;

        this.image=image;
    }
}
