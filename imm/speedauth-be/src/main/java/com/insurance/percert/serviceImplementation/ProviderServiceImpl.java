package com.insurance.percert.serviceImplementation;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.insurance.percert.Repository.ProviderRepository;
import com.insurance.percert.model.ProviderEntity;
import com.insurance.percert.service.ProviderService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ProviderServiceImpl implements ProviderService {
    @Autowired
    private ProviderRepository providerRepository;

    private static final String NPI_PREFIX = "NPI";
    private static final int INITIAL_NPI_NUMBER = 1;

    // @Override
    // public String createProviderData(ProviderEntity providerEntity) {
    // ProviderEntity savedProvider = providerRepository.save(providerEntity);
    // return "Patient saved with ID: " + savedProvider.getProviderId();

    // }

    @Override
    public ProviderEntity createProviderData(ProviderEntity providerEntity) {
        // Generate the next NPI number
        String newNpiNumber = generateNextNpiNumber();

        // Set the NPI number in the provider entity
        providerEntity.setNpiNumber(newNpiNumber);

        // Save the provider entity to the database
        ProviderEntity savedProvider = providerRepository.save(providerEntity);

        return savedProvider;
    }

    // Method to generate the next NPI number
    private String generateNextNpiNumber() {
        // Fetch the provider with the highest NPI number
        Optional<ProviderEntity> lastProvider = providerRepository.findTopByOrderByNpiNumberDesc();

        if (lastProvider.isPresent() && lastProvider.get().getNpiNumber() != null) {
            String lastNpi = lastProvider.get().getNpiNumber();
            try {
                // Extract the number part from "NPI####" and increment it
                int lastNumber = Integer.parseInt(lastNpi.substring(3));
                return NPI_PREFIX + String.format("%03d", lastNumber + 1); // Increment and format as "NPI####"
            } catch (NumberFormatException e) {
                // Handle case where the number part is not parsable (e.g., corrupted data)
                throw new RuntimeException("Invalid NPI format in the database", e);
            }
        } else {
            // Start with "NPI0001" if no providers exist or NPI is null
            return NPI_PREFIX + String.format("%03d", INITIAL_NPI_NUMBER);
        }
    }

    // @Override
    // public ProviderEntity createPatientData(ProviderEntity providerEntity) {
    // return providerRepository.save(providerEntity);
    // }

    @Override
    public List<ProviderEntity> getAllProviderDetails() {
        return providerRepository.findAll();
    }

    @Override
    public ProviderEntity getProviderById(Long id) {
        ProviderEntity providerbyId = providerRepository.findById(id).get();
        return providerbyId;
    }

    @Override
    public ProviderEntity updateProviderDetails(Long id, ProviderEntity ProviderEntity) {
        ProviderEntity existingrecord = providerRepository.findById(id).get();
        if (existingrecord != null) {
            existingrecord.setProviderName(ProviderEntity.getProviderName());
            existingrecord.setFirstName(ProviderEntity.getFirstName());
            existingrecord.setLastName(ProviderEntity.getLastName());
            existingrecord.setProviderType(ProviderEntity.getProviderType());
            existingrecord.setProviderContact(ProviderEntity.getProviderContact());
            existingrecord.setNpiNumber(ProviderEntity.getNpiNumber());
            existingrecord.setTaxId(ProviderEntity.getTaxId());

            ProviderEntity updatedrecord = providerRepository.save(existingrecord);
            return updatedrecord;
        } else {
            return null;
        }

    }

    @Override
    public ProviderEntity updateProviderDetailsByNpi(String npiNumber, ProviderEntity ProviderEntity) {
        ProviderEntity existingrecord = providerRepository.findByNpiNumber(npiNumber).get();
        if (existingrecord != null) {
            existingrecord.setProviderName(ProviderEntity.getProviderName());
            existingrecord.setFirstName(ProviderEntity.getFirstName());
            existingrecord.setLastName(ProviderEntity.getLastName());
            existingrecord.setNpiNumber(ProviderEntity.getNpiNumber());
            existingrecord.setProviderContact(ProviderEntity.getProviderContact());
            existingrecord.setProviderType(ProviderEntity.getProviderType());
            existingrecord.setTaxId(ProviderEntity.getTaxId());
            ProviderEntity updatedrecord = providerRepository.save(existingrecord);
            return updatedrecord;
        } else {
            return null;
        }

    }

    @Override
    public void deleteProviderDetails(Long id) {
        providerRepository.deleteById(id);
    }

    @Override
    public Optional<ProviderEntity> getProviderByNpiNumber(String npiNumber) {
        return providerRepository.findByNpiNumber(npiNumber);
    }
    @Override
    public ProviderEntity getProviderByProviderName(String providerName) {
        if (providerName == null) return null;
        return providerRepository.findByProviderNameIgnoreCase(providerName.trim());
    }

    @Override
    public ProviderEntity getUniqueProviderByNpiNumber(String npiNumber) {
        return providerRepository.findByNpiNumber(npiNumber).get();
    }

    @Override
    public List<ProviderEntity> searchProvidersByName(String providerName) {
        return providerRepository.findByProviderNameContainingIgnoreCase(providerName);
    }

}
