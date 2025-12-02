package com.insurance.percert.service;

import java.util.List;
import java.util.Optional;

import com.insurance.percert.model.ClaimEntity;

public interface ClaimService {

    ClaimEntity createClaim(ClaimEntity claim);

    List<ClaimEntity> getAllClaims();

    Optional<ClaimEntity> getClaimById(Long claimId);

    ClaimEntity updateClaim(Long claimId, ClaimEntity claim);

    void deleteClaim(Long claimId);
}

