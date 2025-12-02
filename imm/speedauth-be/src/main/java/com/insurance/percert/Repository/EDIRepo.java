package com.insurance.percert.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.percert.model.EDIEntity;

public interface EDIRepo extends JpaRepository<EDIEntity,Long> {
    List<EDIEntity> findByTransactionId(String transactionId);
}
