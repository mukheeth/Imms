package com.insurance.percert.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.percert.model.Authorization;

public interface AuthorizationRepository extends JpaRepository<Authorization, Long> {

    Optional<Authorization> findTopByOrderByUniqueAuthIdDesc();

    Optional<Authorization> findByProviderName(String providerName);

    Optional<Authorization> findByAuthorizationId(Long requestId);

    // Optional<Authorization> findByUniqueAuthIdDesc();




}
