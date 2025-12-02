package com.insurance.percert.service;

import java.util.List;

import com.insurance.percert.model.Practice;

public interface PracticeService  {
     Practice createPractice(Practice practice);
    Practice getPracticeById(Long id);
    List<Practice> getAllPractices();
    Practice updatePractice(Long id, Practice practice);
    void deletePractice(Long id);
    Practice signUpPractice(String email, String password, String confirmpassword);
    Practice signInPractice(String email, String password);
    String initiatePasswordReset(String email);
    Practice resetPassword(String token, String newPassword);
}
