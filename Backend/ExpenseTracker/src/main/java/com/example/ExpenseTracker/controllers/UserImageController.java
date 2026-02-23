package com.example.ExpenseTracker.controllers;



import com.example.ExpenseTracker.services.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserImageController {

    private final CloudinaryService cloudinaryService;

    public UserImageController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/upload-profile-image")
    public ResponseEntity<?> uploadProfileImage(
            @RequestParam("image") MultipartFile image
    ) {
        String imageUrl = cloudinaryService.uploadImage(image);

        return ResponseEntity.ok().body(
                Map.of(
                        "message", "Image uploaded successfully",
                        "imageUrl", imageUrl
                )
        );
    }
}

