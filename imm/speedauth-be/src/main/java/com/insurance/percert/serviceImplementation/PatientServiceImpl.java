package com.insurance.percert.serviceImplementation;

import java.text.DecimalFormat;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.insurance.percert.Repository.PatientRepository;
import com.insurance.percert.model.PatientEntity;
import com.insurance.percert.service.PatientService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class PatientServiceImpl implements PatientService {
    @Autowired
    private PatientRepository patientRepository;

    // @Override
    // public String createPatientData(PatientEntity patientEntity) {
    // PatientEntity savedPatient = patientRepository.save(patientEntity);
    // return "Patient saved with ID: " + savedPatient.getPatientId();

    // }

    private static final String PATIENT_ID_PREFIX = "PAT";
    private static final DecimalFormat idFormat = new DecimalFormat("000");

    // Method to create patient with formatted custom ID
    @Transactional
    public PatientEntity createPatientData(PatientEntity patientEntity) {
        String newPatientId = generateNextPatientId();
        System.out.println("patientidaaaaaaaaaaa" + newPatientId);
        patientEntity.setCustomPatientId(newPatientId);
        PatientEntity savedPatient = patientRepository.save(patientEntity);
        return savedPatient;
        // return patientRepository.save(patient);
    }

    private String generateNextPatientId() {
        Optional<PatientEntity> lastPatient = patientRepository.findTopByOrderByCustomPatientIdDesc();

        if (lastPatient.isPresent()) {
            String lastId = lastPatient.get().getCustomPatientId();

            if (lastId != null && !lastId.isEmpty()) {
                int idNumber = Integer.parseInt(lastId.substring(3)); // Extract the number part
                return PATIENT_ID_PREFIX + idFormat.format(idNumber + 1); // Increment and format
            }
        }

        // If no lastId is found or it is null, start with PAT001
        return PATIENT_ID_PREFIX + "001";
    }
    // @Override
    // public PatientEntity createPatientData(PatientEntity patientEntity) {
    // return patientRepository.save(patientEntity);
    // }

    @Override
    public List<PatientEntity> getAllPatientDetails() {
        return patientRepository.findAll();
    }

    @Override
    public PatientEntity getPatientById(Long id) {
        PatientEntity recordings = patientRepository.findById(id).get();
        return recordings;
    }

    @Override
    public PatientEntity updatePatientDetails(Long id, PatientEntity PatientEntity) {
        PatientEntity existingrecord = patientRepository.findById(id).get();
        if (existingrecord != null) {
            existingrecord.setFirstName(PatientEntity.getFirstName());
            existingrecord.setContactNumber(PatientEntity.getContactNumber());
            existingrecord.setLastName(PatientEntity.getLastName());
            existingrecord.setFullName(PatientEntity.getFullName());
            existingrecord.setDateOfBirth(PatientEntity.getDateOfBirth());
            existingrecord.setDateOfService(PatientEntity.getDateOfService());
            existingrecord.setFromDateOfService(PatientEntity.getFromDateOfService());
            existingrecord.setToDateOfService(PatientEntity.getToDateOfService());
            existingrecord.setGender(PatientEntity.getGender());
            existingrecord.setPrimaryInsurance(PatientEntity.getPrimaryInsurance());
            existingrecord.setSecondaryInsurance(PatientEntity.getSecondaryInsurance());
            existingrecord.setPrimaryPolicyNumber(PatientEntity.getPrimaryPolicyNumber());
            existingrecord.setSecondaryPolicyNumber(PatientEntity.getSecondaryPolicyNumber());
            existingrecord.setPrecertificationType(PatientEntity.getPrecertificationType());
            existingrecord.setFacilityName(PatientEntity.getFacilityName());
            existingrecord.setFacilityAddress(PatientEntity.getFacilityAddress());
            existingrecord.setSubscriberId(PatientEntity.getSubscriberId());
            existingrecord.setIcdCode(PatientEntity.getIcdCode());
            existingrecord.setProcedureCode(PatientEntity.getProcedureCode());
            existingrecord.setDescription(PatientEntity.getDescription());
            PatientEntity updatedrecord = patientRepository.save(existingrecord);
            return updatedrecord;
        } else {
            return null;
        }

    }

    @Override
    public PatientEntity updatePatientDetailsByPatientId(Long patientId, PatientEntity PatientEntity) {
        PatientEntity existingrecord = patientRepository.findByPatientId(patientId).get();
        if (existingrecord != null) {
            existingrecord.setFirstName(PatientEntity.getFirstName());
            existingrecord.setContactNumber(PatientEntity.getContactNumber());
            existingrecord.setLastName(PatientEntity.getLastName());
            existingrecord.setDateOfBirth(PatientEntity.getDateOfBirth());
            existingrecord.setGender(PatientEntity.getGender());
            existingrecord.setPrimaryInsurance(PatientEntity.getPrimaryInsurance());
            existingrecord.setSecondaryInsurance(PatientEntity.getSecondaryInsurance());
            existingrecord.setPrimaryPolicyNumber(PatientEntity.getPrimaryPolicyNumber());
            existingrecord.setSecondaryPolicyNumber(PatientEntity.getSecondaryPolicyNumber());
            existingrecord.setDateOfService(PatientEntity.getDateOfService());
            existingrecord.setFromDateOfService(PatientEntity.getFromDateOfService());
            existingrecord.setToDateOfService(PatientEntity.getToDateOfService());
            existingrecord.setIcdCode(PatientEntity.getIcdCode());
            existingrecord.setPrecertificationType(PatientEntity.getPrecertificationType());
            existingrecord.setProcedureCode(PatientEntity.getProcedureCode());
            existingrecord.setSubscriberId(PatientEntity.getSubscriberId());
            PatientEntity updatedrecord = patientRepository.save(existingrecord);
            return updatedrecord;
        } else {
            return null;
        }

    }

    @Override
    public PatientEntity updatePatientDetailsByCustomPatientId(String customPatientId, PatientEntity patientEntity) {
        PatientEntity existingRecord = patientRepository.findByCustomPatientId(customPatientId).orElse(null);

        if (existingRecord != null) {
            // Update fields based on incoming request
            if (patientEntity.getFullName() != null) {
                existingRecord.setFullName(patientEntity.getFullName());
                // Assuming fullName is a concatenation of first and last name
                String[] nameParts = patientEntity.getFullName().split(" ");
                if (nameParts.length > 0) {
                    existingRecord.setFirstName(nameParts[0]); // Assuming first part is first name
                }
                if (nameParts.length > 1) {
                    existingRecord.setLastName(nameParts[1]); // Assuming second part is last name
                }
            }

            if (patientEntity.getDateOfBirth() != null) {
                existingRecord.setDateOfBirth(patientEntity.getDateOfBirth());
            }
            if (patientEntity.getGender() != null) {
                existingRecord.setGender(patientEntity.getGender());
            }
            if (patientEntity.getDescription() != null) {
                existingRecord.setDescription(patientEntity.getDescription());
            }

            if (patientEntity.getContactNumber() != null) {
                existingRecord.setContactNumber(patientEntity.getContactNumber());
            }

            if (patientEntity.getFacilityName() != null) {
                existingRecord.setFacilityName(patientEntity.getFacilityName());
            }

            if (patientEntity.getFacilityAddress() != null) {
                existingRecord.setFacilityAddress(patientEntity.getFacilityAddress());
            }
            if (patientEntity.getDateOfService() != null) {
                existingRecord.setDateOfService(patientEntity.getDateOfService());
            }

            if (patientEntity.getFromDateOfService() != null) {
                existingRecord.setFromDateOfService(patientEntity.getFromDateOfService());
            }

            if (patientEntity.getToDateOfService() != null) {
                existingRecord.setToDateOfService(patientEntity.getToDateOfService());
            }
            if (patientEntity.getIcdCode() != null) {
                existingRecord.setIcdCode(patientEntity.getIcdCode());
            }
            if (patientEntity.getProcedureCode() != null) {
                existingRecord.setProcedureCode(patientEntity.getProcedureCode());
            }
            if (patientEntity.getPrecertificationType() != null) {
                existingRecord.setPrecertificationType(patientEntity.getPrecertificationType());
            }
            if (patientEntity.getInsuranceId() != null) {
                existingRecord.setInsuranceId(patientEntity.getInsuranceId());
            }

            // Add any other fields you want to update here

            PatientEntity updatedRecord = patientRepository.save(existingRecord);
            return updatedRecord;
        } else {
            return null; // Or throw an exception if record is not found
        }
    }

    @Override
    public Optional<PatientEntity> getPatientByUniqueId(String customPatientId) {
        return patientRepository.findByCustomPatientId(customPatientId);
    }

    @Override
    public void deletePatientDetails(Long id) {
        patientRepository.deleteById(id);
    }

    @Override
public List<PatientEntity> searchPatientsByName(String name) {
    return patientRepository.findByFullNameContainingIgnoreCase(name);
}


}
