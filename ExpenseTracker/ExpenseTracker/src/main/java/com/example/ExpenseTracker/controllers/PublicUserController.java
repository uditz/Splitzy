package com.example.ExpenseTracker.controllers;

import com.example.ExpenseTracker.DTOs.UserRequestDTO;
import com.example.ExpenseTracker.entity.User;
import com.example.ExpenseTracker.security.JwtResponse;
import com.example.ExpenseTracker.security.JwtUtil;
import com.example.ExpenseTracker.services.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import com.example.ExpenseTracker.DTOs.UserResponseDTO;

@RestController
@RequestMapping("/public")
public class PublicUserController {

    @GetMapping("/user/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        User user = userService.findUserById(id);
        if (user == null || user.getId() == null) {
            return ResponseEntity.notFound().build();
        }
        UserResponseDTO dto = new UserResponseDTO(user.getId(), user.getName(), user.getEmail(), user.getImageUrl(),
                user.getBio());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/health")
    public ResponseEntity<String> checkHealth() {
        return ResponseEntity.ok("Backend is Reachable!");
    }

    @Autowired
    UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private AuthenticationManager authenticationManager;

    // @PostMapping("/register")
    // public ResponseEntity<UserRequestDTO> createUser(@RequestBody UserRequestDTO
    // dto){
    // User user = new User();
    // user.setName(dto.getName());
    // user.setEmail(dto.getEmail());
    //
    // user.setPassword(encoder.encode(dto.getPassword()));
    // userService.createNewUser(user);
    // return new ResponseEntity<UserRequestDTO>(dto, HttpStatus.OK);
    // }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createUser(
            @RequestParam("user") String userJson, // ← String, not Object
            @RequestParam(value = "image", required = false) MultipartFile image) throws JsonProcessingException {

        // Convert JSON string to DTO
        ObjectMapper mapper = new ObjectMapper();
        UserRequestDTO dto = mapper.readValue(userJson, UserRequestDTO.class);

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = userService.uploadProfileImage(image);
        } else {
            imageUrl = "https://res.cloudinary.com/dmnqdiee9/image/upload/v1765298508/expense-tracker/users/gkzsicilzoohllmqqism.png";
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(encoder.encode(dto.getPassword()));
        user.setImageUrl(imageUrl);
        user.setBio(dto.getBio());

        userService.createNewUser(user);

        userService.createNewUser(user);

        // Return the created user details (excluding sensitive info if DTO used, but
        // here simpler)
        // Or at least a map
        return ResponseEntity.status(HttpStatus.CREATED).body(java.util.Map.of(
                "message", "User registered successfully",
                "userId", user.getId(), // Note: ID might be null if not flushed, but let's assume service handles it
                "username", user.getName(),
                "imageUrl", user.getImageUrl() == null ? "" : user.getImageUrl()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserRequestDTO dto) {
        try {
            // Step 1: Authenticate the user with the credentials (username, password)
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            dto.getName(),
                            dto.getPassword()));

            // Step 2: If authentication is successful, generate a JWT token
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtil.generateToken(authentication.getName());

            // Fetch full User details
            // Assuming you have a UserRepository or UserService to find by name/email
            User user = userService.findByUsername(dto.getName()); // You might need to add this method to Service if
                                                                   // not exists, or Repository

            // Step 3: Return the JWT token AND user details
            return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), user.getName(), user.getImageUrl()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }
}
