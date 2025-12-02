package com.insurance.percert.serviceImplementation;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.insurance.percert.Repository.InsuranceRepository;
import com.insurance.percert.model.Insurance;
import com.insurance.percert.model.InsuranceSummaryDTO;
import com.insurance.percert.service.InsuranceService;

@Service
public class InsuranceServiceImplementation implements InsuranceService {

    private static final String INSURANCE_ID_PREFIX = "INS";
    private static final java.text.DecimalFormat idFormat = new java.text.DecimalFormat("000");

    @Autowired
    private InsuranceRepository insuranceRepository;

    @Transactional
    public Insurance createInsurance(Insurance insurance) {
        String newInsuranceId = generateNextInsuranceId();
        System.out.println("insuranceId: " + newInsuranceId);
        insurance.setCustomInsuranceId(newInsuranceId);
        Insurance savedInsurance = insuranceRepository.save(insurance);
        return savedInsurance;
    }

    private String generateNextInsuranceId() {
        Optional<Insurance> lastInsurance = insuranceRepository.findTopByOrderByCustomInsuranceIdDesc();

        if (lastInsurance.isPresent()) {
            String lastId = lastInsurance.get().getCustomInsuranceId();

            if (lastId != null && !lastId.isEmpty()) {
                int idNumber = Integer.parseInt(lastId.substring(3)); // Extract the number part
                return INSURANCE_ID_PREFIX + idFormat.format(idNumber + 1); // Increment and format
            }
        }

        // If no lastId is found or it is null, start with INS001
        return INSURANCE_ID_PREFIX + "001";
    }

    @Override
    public Insurance getInsuranceById(Long id) {
        Optional<Insurance> optionalInsurance = insuranceRepository.findById(id);
        if (optionalInsurance.isPresent()) {
            return optionalInsurance.get();
        } else {
            throw new RuntimeException("Insurance not found for ID: " + id);
        }
    }

    @Override
    public List<Insurance> getAllInsurances() {
        return insuranceRepository.findAll();
    }

    @Override
    public Insurance updateInsurance(Long id, Insurance updatedInsurance) {

        Insurance existingInsurance = getInsuranceById(id);

        existingInsurance.setName(updatedInsurance.getName());
        existingInsurance.setContactPerson(updatedInsurance.getContactPerson());
        existingInsurance.setAddress(updatedInsurance.getAddress());
        existingInsurance.setContactNumber(updatedInsurance.getContactNumber());
        existingInsurance.setRequestType(updatedInsurance.getRequestType());
        existingInsurance.setRequestUrl(updatedInsurance.getRequestUrl());
        existingInsurance.setUserId(updatedInsurance.getUserId());
        existingInsurance.setPassword(updatedInsurance.getPassword());
        existingInsurance.setPayerName(updatedInsurance.getPayerName());
        existingInsurance.setPayerId(updatedInsurance.getPayerId());
        existingInsurance.setPayerContact(updatedInsurance.getPayerContact());

        // Save the updated entity
        return insuranceRepository.save(existingInsurance);
    }

    @Override
    public Insurance updateInsuranceByCustomInsuranceId(String customInsuranceId, Insurance updatedInsurance) {
        // Fetch the existing insurance record based on customInsuranceId or throw an exception if not found
        Insurance existingInsurance = insuranceRepository.findByCustomInsuranceId(customInsuranceId)
                                                         .orElseThrow(() -> new RuntimeException("Insurance not found with customInsuranceId: " + customInsuranceId));
    
        // Ensure updatedInsurance is not null before proceeding
        if (updatedInsurance == null) {
            throw new NullPointerException("Updated insurance details cannot be null");
        }
    
        // Safely update the fields if they are not null
        if (updatedInsurance.getName() != null) {
            existingInsurance.setName(updatedInsurance.getName());
        }
        if (updatedInsurance.getContactPerson() != null) {
            existingInsurance.setContactPerson(updatedInsurance.getContactPerson());
        }
        // Do not update insuranceId as it is typically a primary key
        if (updatedInsurance.getAddress() != null) {
            existingInsurance.setAddress(updatedInsurance.getAddress());
        }
        if (updatedInsurance.getContactNumber() != null) {
            existingInsurance.setContactNumber(updatedInsurance.getContactNumber());
        }
        if (updatedInsurance.getRequestType() != null) {
            existingInsurance.setRequestType(updatedInsurance.getRequestType());
        }
        if (updatedInsurance.getRequestUrl() != null) {
            existingInsurance.setRequestUrl(updatedInsurance.getRequestUrl());
        }
        if (updatedInsurance.getUserId() != null) {
            existingInsurance.setUserId(updatedInsurance.getUserId());
        }
        if (updatedInsurance.getPassword() != null) {
            existingInsurance.setPassword(updatedInsurance.getPassword());
        }
        if (updatedInsurance.getPayerName() != null) {
            existingInsurance.setPayerName(updatedInsurance.getPayerName());
        }
        if (updatedInsurance.getPayerId() != null) {
            existingInsurance.setPayerId(updatedInsurance.getPayerId());
        }
        if (updatedInsurance.getPayerContact() != null) {
            existingInsurance.setPayerContact(updatedInsurance.getPayerContact());
        }
    
        // Save and return the updated insurance record
        return insuranceRepository.save(existingInsurance);
    }
    


    

    @Override
    public Insurance updateInsuranceByPayerName(String name, Insurance updatedInsurance) {
        // Fetch the existing insurance record based on customInsuranceId or throw an exception if not found
        Insurance existingInsurance = insuranceRepository.findByPayerNameIgnoreCase(name)
                                                         .orElseThrow(() -> new RuntimeException("Insurance not found with customInsuranceId: " + name));
    
        // Ensure updatedInsurance is not null before proceeding
        if (updatedInsurance == null) {
            throw new NullPointerException("Updated insurance details cannot be null");
        }
    
        // Safely update the fields if they are not null
        if (updatedInsurance.getName() != null) {
            existingInsurance.setName(updatedInsurance.getName());
        }
        if (updatedInsurance.getContactPerson() != null) {
            existingInsurance.setContactPerson(updatedInsurance.getContactPerson());
        }
        // Do not update insuranceId as it is typically a primary key
        if (updatedInsurance.getAddress() != null) {
            existingInsurance.setAddress(updatedInsurance.getAddress());
        }
        if (updatedInsurance.getContactNumber() != null) {
            existingInsurance.setContactNumber(updatedInsurance.getContactNumber());
        }
        if (updatedInsurance.getRequestType() != null) {
            existingInsurance.setRequestType(updatedInsurance.getRequestType());
        }
        if (updatedInsurance.getRequestUrl() != null) {
            existingInsurance.setRequestUrl(updatedInsurance.getRequestUrl());
        }
        if (updatedInsurance.getUserId() != null) {
            existingInsurance.setUserId(updatedInsurance.getUserId());
        }
        if (updatedInsurance.getPassword() != null) {
            existingInsurance.setPassword(updatedInsurance.getPassword());
        }
        // if (updatedInsurance.getPayerName() != null) {
        //     existingInsurance.setPayerName(updatedInsurance.getPayerName());
        // }
        if (updatedInsurance.getPayerId() != null) {
            existingInsurance.setPayerId(updatedInsurance.getPayerId());
        }
        if (updatedInsurance.getPayerContact() != null) {
            existingInsurance.setPayerContact(updatedInsurance.getPayerContact());
        }
    
        // Save and return the updated insurance record
        return insuranceRepository.save(existingInsurance);
    }

    @Override
    public void deleteInsurance(Long id) {
        insuranceRepository.deleteById(id);
    }

    @Override
    public Optional<Insurance> getInsuranceByCustomInsuranceId(String customInsuranceId) {
        return insuranceRepository.findByCustomInsuranceId(customInsuranceId);
    }

    @Override
    public Optional<Insurance> getInsuranceByName(String name) {
        return insuranceRepository.findByPayerNameIgnoreCase(name);
    }

    @Override
    public List<InsuranceSummaryDTO> searchInsurancesByPayerName(String payerName) {
        List<Insurance> results = insuranceRepository.findByPayerNameContainingIgnoreCase(payerName);
        return results.stream()
                .map(i -> new InsuranceSummaryDTO(
                    i.getCustomInsuranceId(),
                    i.getPayerName()
                ))
                .collect(Collectors.toList());
    }

}
