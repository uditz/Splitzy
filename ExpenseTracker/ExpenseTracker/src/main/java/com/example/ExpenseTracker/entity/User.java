package com.example.ExpenseTracker.entity;

import com.example.ExpenseTracker.repository.FriendRepository;
import com.example.ExpenseTracker.security.TruncateSerializer;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "email"), indexes = @Index(name = "idx_user_name", columnList = "name"))
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(length = 500)
    @JsonSerialize(using = TruncateSerializer.class)
    private String imageUrl;

    private String name;

    private String bio;

    @Column(unique = true, nullable = false)
    private String email;
    @JsonSerialize(using = TruncateSerializer.class)
    private String password;

    // Correct: Friendship refers to User, not the other way
    @OneToMany(mappedBy = "requester", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Set<Friendship> sentRequests = new HashSet<>();

    @OneToMany(mappedBy = "accepter", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Set<Friendship> receivedRequests = new HashSet<>();

    // Remove this wrong @JoinTable block — DELETE IT
    // @OneToMany + @JoinTable with Friend is wrong!

    @ElementCollection(fetch = FetchType.EAGER)
    private Set<String> roles = new HashSet<>(List.of("USER"));

}