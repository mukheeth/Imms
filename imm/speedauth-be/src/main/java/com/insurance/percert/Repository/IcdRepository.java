package com.insurance.percert.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.insurance.percert.model.IcdEntity;

public interface IcdRepository extends  JpaRepository<IcdEntity, Long> {

    @Query("SELECT DISTINCT icdCode from IcdEntity")
    List<String> findAllIcdCodes();
    
}
