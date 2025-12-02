package com.insurance.percert.service;

import java.util.List;
import java.util.Optional;

import com.insurance.percert.model.DrugEntity;
import com.insurance.percert.model.PatientEntity;

public interface DrugService {


     public DrugEntity createDrugData(DrugEntity drugEntity);

    public List<DrugEntity> getAllDrugDetails();

    public DrugEntity getDrugById(Long id);

    public DrugEntity updateDrugDetails(Long id, DrugEntity drugEntity);

    List<DrugEntity> findByDrugName(String drugName);
    List<DrugEntity> searchByDrugName(String drugNamePart);

    List<DrugEntity> searchByDrugDescription(String descriptionPart);
    List<DrugEntity> findByDrugDescription(String description);


    
}
