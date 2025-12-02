package com.insurance.percert.service;

import java.util.List;
import java.util.Optional;

import com.insurance.percert.model.Insurance;
import com.insurance.percert.model.InsuranceSummaryDTO;

public interface InsuranceService {

    Insurance createInsurance(Insurance insurance);

    Insurance getInsuranceById(Long id);

    List<Insurance> getAllInsurances();

    Insurance updateInsurance(Long id, Insurance insurance);

    Insurance updateInsuranceByCustomInsuranceId(String customInsuranceId, Insurance insurance);

    Insurance updateInsuranceByPayerName(String name, Insurance insurance);

    void deleteInsurance(Long id);

    Optional<Insurance> getInsuranceByCustomInsuranceId(String customInsuranceId);
    
    Optional<Insurance> getInsuranceByName(String name);

    List<InsuranceSummaryDTO> searchInsurancesByPayerName(String payerName);



}
