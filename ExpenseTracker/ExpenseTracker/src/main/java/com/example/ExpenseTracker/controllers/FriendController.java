package com.example.ExpenseTracker.controllers;

import com.example.ExpenseTracker.DTOs.UserSearchDto;
import com.example.ExpenseTracker.DTOs.UserSearchDto;
import com.example.ExpenseTracker.Enums.FriendStatus;
import com.example.ExpenseTracker.entity.User;
import com.example.ExpenseTracker.services.FriendService;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
//add
//show all firnd
//request send to me
//accept frind
//reject frind
//remove frind
@RestController
@RequestMapping("/friend")
public class FriendController {

    @Autowired
    FriendService friendService;

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    @PostMapping("/add/{accepterName}")
    public ResponseEntity<String> sendFriendRequest(@PathVariable String accepterName) {
        try {
            String requesterName = getCurrentUsername();
            friendService.sendingFriendRequest(requesterName, accepterName);
            return ResponseEntity.status(HttpStatus.CREATED).body("Friend request sent successfully.");
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred.");
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserSearchDto>> getAllFriends() {
        String username = getCurrentUsername();
        List<User> friends = friendService.showAllFriends(username);
        List<UserSearchDto> userSearchDtos=friends
                .stream()
                .map(f ->new UserSearchDto(f.getId(),f.getName(),f.getEmail(),f.getBio(),f.getImageUrl(), FriendStatus.FRIEND))
                .collect(Collectors.toList());
        return ResponseEntity.ok(userSearchDtos);
    }

    @GetMapping("/requests")
    public ResponseEntity<List<UserSearchDto>> showRequestSendToMe() {
        String username = getCurrentUsername();
        List<User> requestList = friendService.showRequestSendToMe(username);
        List<UserSearchDto> userSearchDtos = requestList.stream()
                .map(user -> new UserSearchDto(user.getId(), user.getName(), user.getEmail(),user.getBio(),user.getImageUrl(),FriendStatus.FRIEND))
                .collect(Collectors.toList());
        return ResponseEntity.ok(userSearchDtos);
    }

    @PostMapping("/accept/{senderId}")
    public ResponseEntity<String> acceptRequest(@PathVariable Long senderId) {
        try {
            String receiverName = getCurrentUsername();
            friendService.acceptRequest(receiverName, senderId);
            return ResponseEntity.ok("Friend request accepted.");
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to accept the request.");
        }
    }

    @PostMapping("/reject/{senderId}")
    public ResponseEntity<String>rejectRequest(@PathVariable Long senderId){
        try {
            String receiverName= getCurrentUsername();
            friendService.rejectRequest(receiverName,senderId);
            return ResponseEntity.ok("friend request rejected");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to accept the request");
        }
    }

    @PostMapping("remove/{removerId}")
    public ResponseEntity<String> removeFriend(@PathVariable Long removerId){
        try {
            String username=getCurrentUsername();
            friendService.removeFriend(username,removerId);
            return ResponseEntity.ok("Removed sucessfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("failed to delete some error occured");
        }
    }
    @GetMapping("search")
    public ResponseEntity<List<UserSearchDto>>searchUsers(@RequestParam String keyword){
        String currentUsername= getCurrentUsername();
        List<UserSearchDto>users= friendService.searchUsers(keyword,currentUsername);

        return ResponseEntity.ok(users);
    }




    // You can add other methods like rejectFriend and removeFriend with similar handling
}
