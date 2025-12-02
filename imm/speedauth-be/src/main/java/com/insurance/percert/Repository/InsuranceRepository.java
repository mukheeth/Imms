package com.insurance.percert.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.percert.model.Insurance;

public interface InsuranceRepository extends JpaRepository<Insurance, Long> {
    Optional<Insurance> findTopByOrderByCustomInsuranceIdDesc();

    Optional<Insurance> findByCustomInsuranceId(String customInsuranceId);

    Optional<Insurance> findByPayerNameIgnoreCase(String payerName);

    List<Insurance> findByPayerNameContainingIgnoreCase(String payerName);

}
