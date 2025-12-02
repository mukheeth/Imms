package com.insurance.percert.service;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import com.insurance.percert.model.Authorization;
import com.insurance.percert.model.EDIEntity;
import com.insurance.percert.model.PatientEntity;

public interface EDIService {

    EDIEntity saveEDI(EDIEntity ediEntity);

    List<EDIEntity> getAllEDIs();

    Optional<EDIEntity> getEDIById(Long id);

    List<EDIEntity> getEDIByTransactionId(String transactionId);

    EDIEntity updateEDI(Long id, EDIEntity ediEntity);

    void deleteEDI(Long id);

    String generateEDIFile(Authorization authorization, String string) throws IOException;

    // String generateEDIFile(Authorization authorization, String string);

    
}
