package com.insurance.percert.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.percert.model.RolesEntity;
import com.insurance.percert.model.UserEntity;
import com.insurance.percert.service.UserService;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "*") // Replace with your frontend URL
public class UserController {

    @Autowired
    private UserService userService;

    // @PostMapping("/signup")
    // public UserEntity signUpUser(@RequestParam String email,
    // @RequestParam String password,
    // @RequestParam String userName) {
    // UserEntity newUser = userService.signUpUser(email, password, userName);
    // if (newUser != null) {
    // return newUser;
    // } else {
    // throw new IllegalArgumentException("User with this email already exists");
    // }
    // }
    @PostMapping("/signup")
    public UserEntity signUpUser(@RequestBody UserEntity user) {
        UserEntity newUser = userService.signUpUser(user.getEmail(), user.getPassword(), user.getUserName());
        if (newUser != null) {
            return newUser;
        } else {
            throw new IllegalArgumentException("User with this email already exists");
        }
    }

    @PostMapping("/signin")
    public UserEntity signInUser(@RequestParam String email,
            @RequestParam String password) {
        UserEntity existingUser = userService.signInUser(email, password);
        if (existingUser != null) {
            return existingUser;
        } else {
            throw new IllegalArgumentException("Invalid email or password");
        }
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email) {
        return userService.initiatePasswordReset(email);
    }

    @PostMapping("/reset-password")
    public UserEntity resetPassword(@RequestParam String token,
            @RequestParam String newPassword) {
        return userService.resetPassword(token, newPassword);
    }

    @PutMapping("/edit/role-update/{id}")
    public ResponseEntity<UserEntity> updateUserRole(@PathVariable Long id, @RequestBody UserEntity userEntity) {
        UserEntity updatedUserRole = userService.updateUserRole(id, userEntity);
        return new ResponseEntity<UserEntity>(updatedUserRole, HttpStatus.OK);
    }

    @PostMapping("/signinrole")
    public RolesEntity signInRole(@RequestParam String email,
            @RequestParam String password) {
        RolesEntity existingUser = userService.signInRole(email, password);
        if (existingUser != null) {
            return existingUser;
        } else {
            throw new IllegalArgumentException("Invalid email or password");
        }
    }

}