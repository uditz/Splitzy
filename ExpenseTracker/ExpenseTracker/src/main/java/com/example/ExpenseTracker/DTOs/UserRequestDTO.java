package com.example.ExpenseTracker.DTOs;

import com.example.ExpenseTracker.entity.Expense;
import com.example.ExpenseTracker.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.management.ConstructorParameters;
import java.util.List;

@Data

public class UserRequestDTO {

    private String name;
    private String email;
    private String password;
    private String bio;
    public UserRequestDTO(){}
    public UserRequestDTO(String name, String email, String password,String bio){
        this.name= name;
        this.email=email;
        this.password= password;
        this.bio=bio;
    }

}
