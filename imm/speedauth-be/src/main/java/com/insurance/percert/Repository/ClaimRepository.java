package com.insurance.percert.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.percert.model.ClaimEntity;

public interface ClaimRepository extends JpaRepository<ClaimEntity, Long> {
    
}
