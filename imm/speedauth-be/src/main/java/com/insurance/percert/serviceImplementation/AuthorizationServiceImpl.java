package com.insurance.percert.serviceImplementation;

import java.text.DecimalFormat;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.insurance.percert.Repository.AuthorizationRepository;
import com.insurance.percert.model.Authorization;
import com.insurance.percert.service.AuthorizationService;

@Service
public class AuthorizationServiceImpl implements AuthorizationService {

    @Autowired
    private AuthorizationRepository authorizationRepository;

    private static final String AUTH_ID_PREFIX = "AUTH";
    private static final DecimalFormat idFormat = new DecimalFormat("000");

    @Override
    @Transactional
    public Authorization createAuthorization(Authorization authorization) {
        String newUniqueAuthId = generateNextUniqueAuthId();
        // System.out.println("patientidaaaaaaaaaaa" + newUniqueAuthId);
        LocalDate currentDate = LocalDate.now();
        authorization.setUniqueAuthId(newUniqueAuthId);
        authorization.setAuthorizationStartDate(currentDate);

        LocalDate authorizationEndDate = currentDate.plusWeeks(1);
        authorization.setAuthorizationEndDate(authorizationEndDate);

        return authorizationRepository.save(authorization);
    }


    private String generateNextUniqueAuthId() {
        Optional<Authorization> lastAuth = authorizationRepository.findTopByOrderByUniqueAuthIdDesc();
    
        if (lastAuth.isPresent()) {
            String lastId = lastAuth.get().getUniqueAuthId();
    
            if (lastId != null && lastId.startsWith(AUTH_ID_PREFIX)) {
                try {
                    int idNumber = Integer.parseInt(lastId.substring(AUTH_ID_PREFIX.length())); // Extract numeric part
                    return AUTH_ID_PREFIX + idFormat.format(idNumber + 1); // Increment and format
                } catch (NumberFormatException e) {
                    System.err.println("Invalid uniqueAuthId format: " + lastId);
                }
            }
        }
    
        // If no valid lastId is found, start with AUTH001
        return AUTH_ID_PREFIX + "001";
    }
    

    @Override
    public Authorization getAuthorizationById(Long id) {
        Optional<Authorization> authorization = authorizationRepository.findById(id);
        return authorization.orElseThrow(() -> new RuntimeException("Authorization not found with id: " + id));
    }

    @Override
    public List<Authorization> getAllAuthorizations() {
        return authorizationRepository.findAll();
    }

    @Override
    public Authorization updateAuthorization(Long id, Authorization authorizationDetails) {
        Authorization existingAuthorization = getAuthorizationById(id);
        existingAuthorization.setRequestType(authorizationDetails.getRequestType());
        // existingAuthorization.setResponseStatus(authorizationDetails.getResponseStatus());
        existingAuthorization.setProviderName(authorizationDetails.getProviderName());
        existingAuthorization.setIcdCodeAuth(authorizationDetails.getIcdCodeAuth());
        existingAuthorization.setProcedureCodeAuth(authorizationDetails.getProcedureCodeAuth());
        existingAuthorization.setFacilityLocation(authorizationDetails.getFacilityLocation());
        // existingAuthorization.setRequestSentStatus(authorizationDetails.getRequestSentStatus());
        existingAuthorization.setRequestStatus(authorizationDetails.getRequestStatus());

        // existingAuthorization.setEligibilityStatus(authorizationDetails.getEligibilityStatus());
        // existingAuthorization.setValidationStatus(authorizationDetails.getValidationStatus());

        existingAuthorization.setAuthorizationStartDate(authorizationDetails.getAuthorizationStartDate());
        existingAuthorization.setAuthorizationEndDate(authorizationDetails.getAuthorizationEndDate());
        existingAuthorization.setUnits(authorizationDetails.getUnits());
        existingAuthorization.setDescription(authorizationDetails.getDescription());
        existingAuthorization.setClaimstatus(authorizationDetails.getClaimstatus());
        existingAuthorization.setOrderType(authorizationDetails.getOrderType());
        existingAuthorization.setInitialSaveStatus(authorizationDetails.getInitialSaveStatus());
        if (authorizationDetails.getUniqueAuthId() != null && !authorizationDetails.getUniqueAuthId().isEmpty()) {
            existingAuthorization.setUniqueAuthId(authorizationDetails.getUniqueAuthId());
        }
        // existingAuthorization.setUniqueAuthId(authorizationDetails.getUniqueAuthId());
        return authorizationRepository.save(existingAuthorization);
    }

    @Override
    public Authorization updateAuthorizationRequestStatus(Long id, Authorization authorizationDetails) {
        Authorization existingAuthorization = getAuthorizationById(id);
       
        existingAuthorization.setRequestStatus(authorizationDetails.getRequestStatus());
        return authorizationRepository.save(existingAuthorization);
    }

    @Override
    public Authorization updateAuthorizationInProgress(Long id) {
        System.out.println("Received request to update authorization with ID: " + id);

        Authorization existingAuthorization = getAuthorizationById(id);
        existingAuthorization.setApprovalStatus("In Progress");
        existingAuthorization.setApprovalReason("Status is in Progress.. ");
        existingAuthorization.setAuthorizationStartDate(LocalDate.now());
        return authorizationRepository.save(existingAuthorization);
    }








    @Override
    public void deleteAuthorization(Long id) {
        authorizationRepository.deleteById(id);
    }

    @Override
    public Authorization saveAuthorization(Authorization authorization) {
        return authorizationRepository.save(authorization);
    }

    @Override
    public boolean checkEligibility(Long requestId) {
        // Generate a random eligibility status
        boolean isEligible = new Random().nextBoolean();
        System.out.println("Random status: " + isEligible);
        System.out.println("Request ID: " + requestId);

        // Fetch the Authorization record by ID or throw an exception if not found
        Authorization authorization = authorizationRepository.findByAuthorizationId(requestId)
                .orElseThrow(() -> new RuntimeException("Request ID not found"));

        // Update the request status based on eligibility
        // authorization.setRequestStatus(isEligible ? "Eligible" : "Not Eligible");
        authorization.setEligibilityStatus(isEligible ? "Eligible" : "Not Eligible");

        // Save the updated entity to the database
        authorizationRepository.save(authorization);

        return isEligible;
    }



    @Override
public void checkEligibilityForAll(List<Long> requestIds) {
    for (Long requestId : requestIds) {
        boolean isEligible = new Random().nextBoolean();
        System.out.println("Random status for ID " + requestId + ": " + isEligible);

        Authorization authorization = authorizationRepository.findByAuthorizationId(requestId)
                .orElseThrow(() -> new RuntimeException("Request ID not found: " + requestId));

        authorization.setEligibilityStatus(isEligible ? "Eligible" : "Not Eligible");
        authorizationRepository.save(authorization);
    }
}




    @Override
public void uncheckEligibilityForList(List<Long> requestIds) {
    for (Long requestId : requestIds) {
        // Fetch the Authorization record by ID or throw an exception
        Authorization authorization = authorizationRepository.findByAuthorizationId(requestId)
                .orElseThrow(() -> new RuntimeException("Request ID not found: " + requestId));

        // Instead of "Eligible"/"Not Eligible", set a custom status
        // You can replace "Checking Eligibility" with any other dynamic or meaningful status
        authorization.setEligibilityStatus("Check Eligibility");

        // Save the updated record
        authorizationRepository.save(authorization);
    }
}

@Override
    public boolean validateProvider(Long requestId) {
        // Generate a random eligibility status
        boolean isValid = new Random().nextBoolean();
        System.out.println("Random status: " + isValid);
        System.out.println("Request ID: " + requestId);

        // Fetch the Authorization record by ID or throw an exception if not found
        Authorization authorization = authorizationRepository.findByAuthorizationId(requestId)
                .orElseThrow(() -> new RuntimeException("Provider Name not found for requestId: " + requestId));

        System.out.println("iselgible");
        System.out.println(isValid);

        // Update the request status based on eligibility
        // authorization.setRequestStatus(isEligible ? "Eligible" : "Not Eligible");
        authorization.setValidationStatus(isValid ? "Valid" : "Invalid");

        // Save the updated entity to the database
        authorizationRepository.save(authorization);

        return isValid;
    }


  @Override
public void validateProviders(List<Long> requestIds) {
    for (Long requestId : requestIds) {
        boolean isValid = new Random().nextBoolean();
        System.out.println("Random status for ID " + requestId + ": " + isValid);

        Authorization authorization = authorizationRepository.findByAuthorizationId(requestId)
                .orElseThrow(() -> new RuntimeException("Request ID not found: " + requestId));

        authorization.setValidationStatus(isValid ? "Valid" : "Invalid");
        authorizationRepository.save(authorization);
    }
}



    @Override
    public void invalidateListOfProviders(List<Long> requestIds) {
        for (Long requestId : requestIds) {
            // Fetch the Authorization record by ID or throw an exception
            Authorization authorization = authorizationRepository.findByAuthorizationId(requestId)
                    .orElseThrow(() -> new RuntimeException("Request ID not found: " + requestId));
    
            // Instead of "Eligible"/"Not Eligible", set a custom status
            // You can replace "Checking Eligibility" with any other dynamic or meaningful status
            authorization.setValidationStatus("Check Validation");
    
            // Save the updated record
            authorizationRepository.save(authorization);
        }
    }

    @Override
    public boolean validateCpt(Long requestId) {
        // Generate a random eligibility status
        boolean isValid = new Random().nextBoolean();
        System.out.println("Random status: " + isValid);
        System.out.println("Request ID: " + requestId);

        // Fetch the Authorization record by ID or throw an exception if not found
        Authorization authorization = authorizationRepository.findByAuthorizationId(requestId)
                .orElseThrow(() -> new RuntimeException("Provider Name not found for requestId: " + requestId));

        System.out.println("iselgible");
        System.out.println(isValid);

        // Update the request status based on eligibility
        // authorization.setRequestStatus(isEligible ? "Eligible" : "Not Eligible");
        authorization.setRequestStatus(isValid ? "Auth Required" : "Auth Not Required");
        if (isValid) {
            System.out.println("Auth required");
        } else {
            authorization.setApprovalStatus("Approved");
            authorization.setApprovalReason("The CPT does not require authorization, and the treatment will proceed.");
        }

        // Save the updated entity to the database
        authorizationRepository.save(authorization);

        return isValid;
    }


    @Override
    public void invalidateCptForAll(List<Long> requestIds) {
        for (Long requestId : requestIds) {
            // Fetch the Authorization record by ID or throw an exception
            Authorization authorization = authorizationRepository.findByAuthorizationId(requestId)
                    .orElseThrow(() -> new RuntimeException("Request ID not found: " + requestId));
    
            // Instead of "Eligible"/"Not Eligible", set a custom status
            // You can replace "Checking Eligibility" with any other dynamic or meaningful status
            authorization.setApprovalStatus("yet to submit");
            authorization.setApprovalReason("");
            authorization.setRequestStatus("Check CPT Validation");
    
            // Save the updated record
            authorizationRepository.save(authorization);
        }
    }

    // public boolean validateProvider(String providerName) {
    // // Generate random validation status
    // boolean isValid = new Random().nextBoolean();

    // // Fetch the record and update the status
    // Authorization authorization =
    // authorizationRepository.findByAuthorizationId(providerName)
    // .orElseThrow(() -> new RuntimeException("Provider Name not found"));

    // authorization.setApprovalStatus(isValid ? "Valid" : "Invalid");
    // authorizationRepository.save(authorization);

    // return isValid;
    // }

}
