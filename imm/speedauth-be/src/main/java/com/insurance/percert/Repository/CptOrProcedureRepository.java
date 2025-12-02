package com.insurance.percert.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.*;
import com.insurance.percert.model.CptOrProcedureEntity;

public interface CptOrProcedureRepository extends JpaRepository<CptOrProcedureEntity, Long> {
 
    
     @Query("SELECT DISTINCT cptCode FROM CptOrProcedureEntity")
    List<String> findAllCptCodes();
    
}
