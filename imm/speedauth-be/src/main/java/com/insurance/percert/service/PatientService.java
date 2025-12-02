package com.insurance.percert.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.insurance.percert.model.PatientEntity;
import com.insurance.percert.model.ProviderEntity;

public interface PatientService {

    // public PatientEntity createPatientData(PatientEntity patientEntity);
    public PatientEntity createPatientData(PatientEntity patientEntity);

    public List<PatientEntity> getAllPatientDetails();

    public PatientEntity getPatientById(Long id);

    public PatientEntity updatePatientDetails(Long id, PatientEntity PatientEntity);

    public PatientEntity updatePatientDetailsByPatientId(Long patientId, PatientEntity PatientEntity);

    public PatientEntity updatePatientDetailsByCustomPatientId(String customPatientId, PatientEntity PatientEntity);

    Optional<PatientEntity> getPatientByUniqueId(String uniquePatientNumber);

    void deletePatientDetails(Long id);

    List<PatientEntity> searchPatientsByName(String name);


}
