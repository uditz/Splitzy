package com.example.ExpenseTracker.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.ExpenseTracker.DTOs.UserResponseDTO;
import com.example.ExpenseTracker.entity.User;
import com.example.ExpenseTracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    UserRepository userRepository;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Constructor injection (recommended)
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Called from registration (DTO → Entity conversion in controller)
    public User createNewUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User findUserById(Long id) {
        User user = new User();
        List<User> users = userRepository.findAll();
        for (User u : users) {
            if (u.getId().equals(id)) {
                user = u;
                break;
            }
        }
        return user;

    }

    public User findByUsername(String username) {
        return userRepository.findByName(username); // assuming returns Optional<User>
    }

    public Optional<Long> findUserIdByUsername(String username) {
        User user = userRepository.findByName(username);
        return user != null ? Optional.of(user.getId()) : Optional.empty();
    }
    // Optional: update, delete, etc.

    public String uploadProfileImage(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "expense-tracker/users",
                            "resource_type", "image"));
            return uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            throw new RuntimeException("Image upload failed");
        }
    }

    public void updateUser(String username, UserResponseDTO dto, String imageUrl) {
        User existingUser = findByUsername(username);

        // update fields

        if (imageUrl != null) {
            existingUser.setImageUrl(imageUrl);
        }
        if (dto.getBio() != null) {
            existingUser.setBio(dto.getBio());
        }
        userRepository.save(existingUser);

    }
    public void changePassword(String username,String password,
                                String confirmPassword ,String currentPassword){
            User user= findByUsername(username);
            if(user==null){
                throw new RuntimeException("User not found");
            }
            if(!passwordEncoder.matches(currentPassword,user.getPassword())){
                throw new RuntimeException("Current password is incorrect");
            }
            if(!password.equals(confirmPassword)){
                throw new RuntimeException("Passwords do not match");
            }
            user.setPassword(passwordEncoder.encode(password));
            userRepository.save(user);
                    

    }
}