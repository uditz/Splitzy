package com.example.ExpenseTracker.services;

import com.example.ExpenseTracker.DTOs.UserSearchDto;
import com.example.ExpenseTracker.Enums.FriendStatus;
import com.example.ExpenseTracker.entity.Friendship;
import com.example.ExpenseTracker.Enums.FriendshipStatus;
import com.example.ExpenseTracker.entity.User;
import com.example.ExpenseTracker.repository.FriendRepository;
import com.example.ExpenseTracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import com.example.ExpenseTracker.entity.Notification;
import com.example.ExpenseTracker.repository.NotificationRepo;
import static java.util.stream.Collectors.toList;

@Service
public class FriendService {
    @Autowired
    FriendRepository friendRepository;

    @Autowired
    UserService userService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    NotificationRepo notificationRepo;

    public void sendingFriendRequest(String requesterName, String accepterName) {
        User requester = userService.findByUsername(requesterName);
        User accepter = userService.findByUsername(accepterName);
        Friendship friend = new Friendship();
        friend.setAccepter(accepter);
        friend.setRequester(requester);
        friend.setRequestedAt(LocalDateTime.now());
        friendRepository.save(friend);

        Notification notification = new Notification();
        notification.setUserId(accepter.getId());
        notification.setMessage(requesterName + " sent you a friend request");
        notification.setType("FRIEND_REQUEST");
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepo.save(notification);
    }

    public List<User> showAllFriends(String username) {
        User currentUser = userService.findByUsername(username);
        Set<User> friends = new HashSet<>();

        // I sent request → they accepted
        friendRepository.findByRequesterIdAndStatus(currentUser.getId(), FriendshipStatus.ACCEPTED)
                .forEach(f -> friends.add(f.getAccepter()));

        // They sent request → I accepted
        friendRepository.findByAccepterIdAndStatus(currentUser.getId(), FriendshipStatus.ACCEPTED)
                .forEach(f -> friends.add(f.getRequester()));

        return new ArrayList<>(friends);
    }

    public List<User> showRequestSendToMe(String username) {
        Long userId = userService.findUserIdByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return friendRepository
                .findByAccepterIdAndStatus(userId, FriendshipStatus.PENDING)
                .stream()
                .map(friendship -> friendship.getRequester()) // directly get the requester
                .toList();
    }

    public void acceptRequest(String reqReceiver, Long reqSender) {
        Long userId = userService.findUserIdByUsername(reqReceiver)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Friendship> list = friendRepository.findByAccepterIdAndStatus(userId, FriendshipStatus.PENDING);
        for (Friendship f : list) {
            if (f.getRequester().getId().equals(reqSender)) {
                f.setStatus(FriendshipStatus.ACCEPTED);
                f.setRespondedAt(LocalDateTime.now());
                friendRepository.save(f);
                break;
            }
        }
    }

    public void rejectRequest(String reqReceiver, Long reqSender) {
        Long userId = userService.findUserIdByUsername(reqReceiver)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Friendship> list = friendRepository.findByAccepterIdAndStatus(userId, FriendshipStatus.PENDING);
        if (list == null)
            return;
        for (Friendship f : list) {
            if (f.getRequester().getId().equals(reqSender)) {
                f.setStatus(FriendshipStatus.REJECTED);
                f.setRespondedAt(LocalDateTime.now());
                friendRepository.save(f);
                break;
            }
        }
    }

    public void removeFriend(String username, Long removerId) {
        Long userId = userService.findUserIdByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Friendship> list = friendRepository.findByAccepterIdAndStatus(userId, FriendshipStatus.ACCEPTED);
        if (list == null)
            return;
        for (Friendship f : list) {
            if (f.getRequester().getId().equals(removerId)) {
                friendRepository.delete(f);
            }
        }

    }

    public boolean areFriends(Long requestId, Long accepterId) {
        Optional<Friendship> friend = friendRepository.findByAccepterIdAndRequesterIdAndStatus(accepterId, requestId,
                FriendshipStatus.ACCEPTED);
        if (friend.isEmpty())
            return false;
        return true;
    }

    public List<UserSearchDto> searchUsers(String keyword, String currentUsername) {
        User currentUser = userService.findByUsername(currentUsername);

        List<User> userList = userRepository.findByNameContainingIgnoreCase(keyword);

        return userList.stream().map(user -> {
            FriendStatus status;
            if (currentUser.getId().equals(user.getId()))
                status = FriendStatus.SELF;
            else if (areFriends(user.getId(), currentUser.getId()))
                status = FriendStatus.FRIEND;
            else if (friendRepository.existsByRequesterIdAndAccepterId(user.getId(), currentUser.getId()))
                status = FriendStatus.REQUEST_RECEIVED;
            else if (friendRepository.existsByRequesterIdAndAccepterId(currentUser.getId(), user.getId()))
                status = FriendStatus.REQUEST_SENT;
            else
                status = FriendStatus.NOT_FRIEND;
            return new UserSearchDto(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getBio(),
                    user.getImageUrl(),
                    status

            );

        }).collect(Collectors.toList());

    }

}
