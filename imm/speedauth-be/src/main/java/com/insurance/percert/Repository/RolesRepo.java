package com.insurance.percert.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.percert.model.RolesEntity;

public interface RolesRepo extends JpaRepository<RolesEntity, Long>{
    
}
