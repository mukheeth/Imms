package com.insurance.percert.service;

import com.insurance.percert.model.RolesEntity;
import com.insurance.percert.model.UserEntity;


public interface UserService {
    UserEntity signUpUser(String email, String password, String confirmpassword);

    UserEntity signInUser(String email, String password);
    String initiatePasswordReset(String email);
    UserEntity resetPassword(String token, String newPassword);
    UserEntity updateUserRole(Long id, UserEntity userEntity);
    RolesEntity signInRole(String email, String password);


}
