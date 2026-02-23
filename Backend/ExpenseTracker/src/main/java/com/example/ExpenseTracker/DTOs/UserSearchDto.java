package com.example.ExpenseTracker.DTOs;

import com.example.ExpenseTracker.Enums.FriendStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor

public class UserSearchDto {
    private Long id;
    private String name;
    private String email;
    private FriendStatus friendStatus;
    private String imageUrl;
    private String bio;

    public UserSearchDto(Long id,String name, String email,String bio,String imageUrl, FriendStatus friendStatus){
        this.id= id;
        this.name=name;
        this.email=email;
        this.friendStatus=friendStatus;
        this.imageUrl=imageUrl;
        this.bio=bio;
    }

}
