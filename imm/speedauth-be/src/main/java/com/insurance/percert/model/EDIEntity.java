package com.insurance.percert.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Table(name = "EDI_Details")
@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class EDIEntity {
   @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String transactionId;
    private String transactionType;
    private String documentContent;
    private LocalDateTime createdAt;
    private String receiverId;
    
}
