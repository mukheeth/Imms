package com.insurance.percert.serviceImplementation;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.insurance.percert.Repository.DrugRepository;
import com.insurance.percert.model.DrugEntity;
import com.insurance.percert.model.PatientEntity;
import com.insurance.percert.service.DrugService;

@Service
public class DrugServiceImpl implements  DrugService {


    @Autowired
    private DrugRepository drugRepository;


    @Override
    public DrugEntity createDrugData(DrugEntity drugEntity)
    {
        return drugRepository.save(drugEntity);     
    }

     @Override
    public List<DrugEntity> getAllDrugDetails() {
        return drugRepository.findAll();
    }

    @Override
    public DrugEntity getDrugById(Long id) {
        DrugEntity recordings = drugRepository.findById(id).get();
        return recordings;
    }

    @Override
    public DrugEntity updateDrugDetails(Long id, DrugEntity drugEntity) {
        DrugEntity existingrecord = drugRepository.findById(id).get();
        if (existingrecord != null) {
            existingrecord.setFromDateOfService(drugEntity.getFromDateOfService());
            existingrecord.setToDateOfService(drugEntity.getToDateOfService());
            existingrecord.setProcedureCode(drugEntity.getProcedureCode());
            existingrecord.setDrugName(drugEntity.getDrugName());
            existingrecord.setDrugType(drugEntity.getDrugType());
            existingrecord.setDrugQuantity(drugEntity.getDrugQuantity());
            existingrecord.setNoOfChemo(drugEntity.getNoOfChemo());
            existingrecord.setRequestType(drugEntity.getRequestType());
            existingrecord.setDrugamtdispensed(drugEntity.getDrugamtdispensed());
            existingrecord.setDrugamtdispensedType(drugEntity.getDrugamtdispensedType());
            existingrecord.setPrecertificationType(drugEntity.getPrecertificationType());
            existingrecord.setDrugDescription(drugEntity.getDrugDescription());
            existingrecord.setIcdCode(drugEntity.getIcdCode());
            DrugEntity updatedrecord = drugRepository.save(existingrecord);
            return updatedrecord;
        } else {
            return null;
        }

    }


    @Override
    public List<DrugEntity> findByDrugName(String drugName) {
        return drugRepository.findByDrugName(drugName);
    }

    @Override
    public List<DrugEntity> searchByDrugName(String drugNamePart) {
        return drugRepository.findByDrugNameContainingIgnoreCase(drugNamePart);
    }

    @Override
public List<DrugEntity> searchByDrugDescription(String descriptionPart) {
    return drugRepository.findByDrugDescriptionContainingIgnoreCase(descriptionPart);
}

@Override
public List<DrugEntity> findByDrugDescription(String description) {
    return drugRepository.findByDrugDescription(description);
}
    
    
}
