package com.insurance.percert.model;

import lombok.Data;
import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@Data
@Table(name = "claims_details")
public class ClaimEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long claimId;

    @Temporal(TemporalType.DATE)
    private Date claimDate;

    private String claimType;

    private String claimStatus;

    @Temporal(TemporalType.DATE)
    private Date statusDate;

    private String claimDescription;
}
