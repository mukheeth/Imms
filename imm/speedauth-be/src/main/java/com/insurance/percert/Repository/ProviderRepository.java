package com.insurance.percert.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.percert.model.ProviderEntity;

public interface ProviderRepository extends JpaRepository<ProviderEntity, Long> {

    Optional<ProviderEntity> findTopByOrderByNpiNumberDesc();

    Optional<ProviderEntity> findByNpiNumber(String npiNumber);

    ProviderEntity findByProviderNameIgnoreCase(String providerName);

    List<ProviderEntity> findByProviderNameContainingIgnoreCase(String providerName);



}
