package com.insurance.percert.service;

import java.util.List;

import com.insurance.percert.model.Authorization;

public interface AuthorizationService {

    Authorization createAuthorization(Authorization authorization);

    Authorization getAuthorizationById(Long id);

    List<Authorization> getAllAuthorizations();

    Authorization updateAuthorization(Long id, Authorization authorization);

    Authorization updateAuthorizationRequestStatus(Long id, Authorization authorization);

    
    Authorization updateAuthorizationInProgress(Long id);


    void deleteAuthorization(Long id);

    Authorization saveAuthorization(Authorization authorization);

    boolean checkEligibility(Long requestId);

    void checkEligibilityForAll(List<Long> requestIds);


    void uncheckEligibilityForList(List<Long> requestIds);


    boolean validateProvider(Long requestId);

    void validateProviders(List<Long> requestIds);


    
    void invalidateListOfProviders(List<Long> requestIds);


    boolean validateCpt(Long requestId);

    void invalidateCptForAll(List<Long> requestIds);


}
