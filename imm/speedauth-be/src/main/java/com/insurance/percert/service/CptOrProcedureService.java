package com.insurance.percert.service;

import com.insurance.percert.model.CptOrProcedureEntity;
import java.util.*;

public interface CptOrProcedureService {
    
CptOrProcedureEntity createCpt(CptOrProcedureEntity cptEntity);

    List<CptOrProcedureEntity> getAllCpt();

    Optional<CptOrProcedureEntity> getCptById(Long id);

    List<String> getAllCptCodes();

}
