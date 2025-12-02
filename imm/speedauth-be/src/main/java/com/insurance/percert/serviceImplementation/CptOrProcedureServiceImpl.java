package com.insurance.percert.serviceImplementation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.insurance.percert.Repository.CptOrProcedureRepository;
import com.insurance.percert.model.CptOrProcedureEntity;
import com.insurance.percert.service.CptOrProcedureService;
import java.util.*;
@Service
public class CptOrProcedureServiceImpl implements CptOrProcedureService {
    

    @Autowired
    private CptOrProcedureRepository cptRepository;

    @Override
    public CptOrProcedureEntity createCpt(CptOrProcedureEntity cptEntity) {
        return cptRepository.save(cptEntity);
    }

    @Override
    public List<CptOrProcedureEntity> getAllCpt() {
        return cptRepository.findAll();
    }

    @Override
    public Optional<CptOrProcedureEntity> getCptById(Long id) {
        return cptRepository.findById(id);
    }

    @Override
    public List<String> getAllCptCodes() {
        return cptRepository.findAllCptCodes();
    }

}
