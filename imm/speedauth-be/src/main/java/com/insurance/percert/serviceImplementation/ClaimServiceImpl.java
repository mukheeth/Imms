package com.insurance.percert.serviceImplementation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.insurance.percert.Repository.ClaimRepository;
import com.insurance.percert.model.ClaimEntity;
import com.insurance.percert.service.ClaimService;

import java.util.List;
import java.util.Optional;

@Service
public class ClaimServiceImpl implements ClaimService {

    private final ClaimRepository claimRepository;

    @Autowired
    public ClaimServiceImpl(ClaimRepository claimRepository) {
        this.claimRepository = claimRepository;
    }

    @Override
    public ClaimEntity createClaim(ClaimEntity claim) {
        return claimRepository.save(claim);
    }

    @Override
    public List<ClaimEntity> getAllClaims() {
        return claimRepository.findAll();
    }

    @Override
    public Optional<ClaimEntity> getClaimById(Long claimId) {
        return claimRepository.findById(claimId);
    }

    @Override
    public ClaimEntity updateClaim(Long claimId, ClaimEntity claim) {
        if (claimRepository.existsById(claimId)) {
            claim.setClaimId(claimId); 
            return claimRepository.save(claim);
        }
        return null;
    }

    @Override
    public void deleteClaim(Long claimId) {
        claimRepository.deleteById(claimId);
    }
}
