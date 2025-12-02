package com.insurance.percert.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "practice_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Practice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long practiceId;

    @Column(nullable = false)
    private String taxId;

    @Column(nullable = false)
    private String nameOfPractice;

    private String contactNumber;
    private String contactPerson;
    private String address;
    private String practiceNpiNumber;
    
    private String practiceName;
    private String email;
    private String password;
    private String resetToken;
}

