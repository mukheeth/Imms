package com.insurance.percert.service;

import java.util.List;
import java.util.Optional;

import com.insurance.percert.model.ProviderEntity;

public interface ProviderService {
    // public ProviderEntity createPatientData(ProviderEntity patientEntity);
    public ProviderEntity createProviderData(ProviderEntity providerEntity);

    public List<ProviderEntity> getAllProviderDetails();

    public ProviderEntity getProviderById(Long id);

    public ProviderEntity updateProviderDetails(Long id, ProviderEntity ProviderEntity);

    public ProviderEntity updateProviderDetailsByNpi(String npiNumber, ProviderEntity ProviderEntity);

    void deleteProviderDetails(Long id);

    Optional<ProviderEntity> getProviderByNpiNumber(String npiNumber);

    ProviderEntity getProviderByProviderName(String providerName);

    ProviderEntity getUniqueProviderByNpiNumber(String npiNumber);

    List<ProviderEntity> searchProvidersByName(String providerName);


}
