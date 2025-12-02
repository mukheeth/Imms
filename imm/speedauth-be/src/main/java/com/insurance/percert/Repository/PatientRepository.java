package com.insurance.percert.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.percert.model.PatientEntity;
import java.util.List;

public interface PatientRepository extends JpaRepository<PatientEntity, Long> {
    Optional<PatientEntity> findTopByOrderByCustomPatientIdDesc();

    Optional<PatientEntity> findByCustomPatientId(String customPatientId);

    Optional<PatientEntity> findByPatientId(Long patientId);

    // Find patients by partial name (case-insensitive)
List<PatientEntity> findByFullNameContainingIgnoreCase(String name);



}
