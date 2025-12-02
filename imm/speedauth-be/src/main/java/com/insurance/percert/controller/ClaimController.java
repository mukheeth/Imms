package com.insurance.percert.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.insurance.percert.model.ClaimEntity;
import com.insurance.percert.service.ClaimService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/claims")
@CrossOrigin(origins = "*") // Replace with your frontend URL

public class ClaimController {

    private final ClaimService claimService;

    @Autowired
    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping
    public ResponseEntity<ClaimEntity> createClaim(@RequestBody ClaimEntity claim) {
        return ResponseEntity.ok(claimService.createClaim(claim));
    }

    @GetMapping
    public ResponseEntity<List<ClaimEntity>> getAllClaims() {
        return ResponseEntity.ok(claimService.getAllClaims());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClaimEntity> getClaimById(@PathVariable("id") Long claimId) {
        Optional<ClaimEntity> claim = claimService.getClaimById(claimId);
        return claim.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClaimEntity> updateClaim(@PathVariable("id") Long claimId, @RequestBody ClaimEntity claim) {
        ClaimEntity updatedClaim = claimService.updateClaim(claimId, claim);
        return updatedClaim != null ? ResponseEntity.ok(updatedClaim) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClaim(@PathVariable("id") Long claimId) {
        claimService.deleteClaim(claimId);
        return ResponseEntity.noContent().build();
    }
}
