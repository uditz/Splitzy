package com.example.ExpenseTracker.DTOs;

import com.example.ExpenseTracker.entity.Expense;
import lombok.Data;
import lombok.Getter;

import java.util.List;

@Data
public class UserResponseDTO {
    Long id;
    String imageUrl;
    String name;
    String email;
    String bio;
    public UserResponseDTO(){}
    public UserResponseDTO(Long id, String name, String email,String imageUrl,String bio) {
        this.id = id;
        this.imageUrl=imageUrl;
        this.name = name;
        this.email = email;
        this.bio=bio;

    }
}
