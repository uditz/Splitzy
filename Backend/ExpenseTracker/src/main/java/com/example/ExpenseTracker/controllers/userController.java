package com.example.ExpenseTracker.controllers;

import com.example.ExpenseTracker.DTOs.UserRequestDTO;
import com.example.ExpenseTracker.DTOs.UserResponseDTO;
import com.example.ExpenseTracker.entity.User;
import com.example.ExpenseTracker.services.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/user")
public class userController {

    private final UserService userService;

    public userController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateUser(
            @RequestParam("user") String userJson,
            @RequestParam(value = "image", required = false) MultipartFile image) throws JsonProcessingException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        ObjectMapper mapper = new ObjectMapper();
        UserResponseDTO dto = mapper.readValue(userJson, UserResponseDTO.class);

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = userService.uploadProfileImage(image);
        }

        userService.updateUser(username, dto, imageUrl);

        return new ResponseEntity<>(HttpStatus.OK);
    }

        @PostMapping("change-password")
        public ResponseEntity<?>changePassword(
                                        @RequestParam("currentPassword") String currentPassword  ,
                                        @RequestParam("newPassword") String password,
                                        @RequestParam("confirmPassword") String confirmPassword               ){
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            userService.changePassword(username,password,confirmPassword,currentPassword);
            return new ResponseEntity<>(HttpStatus.OK);
        }
}