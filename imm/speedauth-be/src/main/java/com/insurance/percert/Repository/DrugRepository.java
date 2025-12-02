package com.insurance.percert.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.percert.model.DrugEntity;

public interface DrugRepository extends JpaRepository<DrugEntity, Long>{
    
    List<DrugEntity> findByDrugName(String drugName);
    // contains (substring)
    List<DrugEntity> findByDrugNameContainingIgnoreCase(String drugNamePart);
    
    List<DrugEntity> findByDrugDescriptionContainingIgnoreCase(String descriptionPart);

    List<DrugEntity> findByDrugDescription(String description);

}
