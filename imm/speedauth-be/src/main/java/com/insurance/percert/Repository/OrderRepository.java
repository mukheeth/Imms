package com.insurance.percert.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.percert.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // List<Order> findByPatient_CustomPatientId(String uniquePatientNumber);
    List<Order> findByUniquepatientI(String uniquepatientI);
    List<Order> findByProviderNpiNumber(String providerNpiNumber);
    List<Order> findByProviderNameIgnoreCase(String providerName);

    List<Order> findByIcddrugname(String icddrugname);
    List<Order> findByIcddrugnameContainingIgnoreCase(String term);
}
