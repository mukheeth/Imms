package com.insurance.percert.controller;

import com.insurance.percert.model.Practice;
import com.insurance.percert.service.PracticeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/practice")
@CrossOrigin(origins = "*") // Replace with your frontend URL
public class PracticeController {

    @Autowired
    private PracticeService practiceService;

    @PostMapping
    public ResponseEntity<Practice> createPractice(@RequestBody Practice practice) {
        return ResponseEntity.ok(practiceService.createPractice(practice));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Practice> getPracticeById(@PathVariable Long id) {
        return ResponseEntity.ok(practiceService.getPracticeById(id));
    }

    @GetMapping
    public ResponseEntity<List<Practice>> getAllPractices() {
        return ResponseEntity.ok(practiceService.getAllPractices());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Practice> updatePractice(
            @PathVariable Long id, @RequestBody Practice practice) {
        return ResponseEntity.ok(practiceService.updatePractice(id, practice));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePractice(@PathVariable Long id) {
        practiceService.deletePractice(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/signup")
    public Practice signUpPractice(@RequestBody Practice practice) {
        Practice newPractice = practiceService.signUpPractice(practice.getEmail(), practice.getPassword(),
                practice.getPracticeName());
        if (newPractice != null) {
            return newPractice;
        } else {
            throw new IllegalArgumentException("Practice with this email already exists");
        }
    }

    @PostMapping("/signin")
    public Practice signInPractice(@RequestParam String email,
            @RequestParam String password) {
        Practice existingPractice = practiceService.signInPractice(email, password);
        if (existingPractice != null) {
            return existingPractice;
        } else {
            throw new IllegalArgumentException("Invalid email or password");

        }
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email) {
        return "practiceService.initiatePasswordReset(email)";
    }

    @PostMapping("/reset-password")
    public Practice resetPassword(@RequestParam String token,
            @RequestParam String newPassword) {
        return practiceService.resetPassword(token, newPassword);
    }
}
