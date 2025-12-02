package com.insurance.percert.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.CascadeType; // ✅ Required import


@Entity
@Table(name = "drug_details")
public class DrugEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long drugId;
    private LocalDate fromDateOfService;
    private LocalDate toDateOfService;
    private String procedureCode;
    private String drugName;
    private String drugType;
    private String drugQuantity;
    private String noOfChemo;
    private String requestType;
    private String drugamtdispensed;
    private String drugamtdispensedType;
    private String precertificationType;
    private String drugDescription;
    private String icdCode;
    
      // One-to-Many with ICD
      @OneToMany(mappedBy = "drug", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
      @JsonManagedReference
      private List<IcdEntity> icdCodes = new ArrayList<>();
  
      // One-to-Many with CPT
      @OneToMany(mappedBy = "drug", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
      @JsonManagedReference
      private List<CptOrProcedureEntity> cptCodes = new ArrayList<>();

    // Getter and Setter for drugId
    public Long getDrugId() {
        return drugId;
    }
    public void setDrugId(Long drugId) {
        this.drugId = drugId;
    }

    // Getter and Setter for fromDateOfService
    public LocalDate getFromDateOfService() {
        return fromDateOfService;
    }
    public void setFromDateOfService(LocalDate fromDateOfService) {
        this.fromDateOfService = fromDateOfService;
    }

    // Getter and Setter for toDateOfService
    public LocalDate getToDateOfService() {
        return toDateOfService;
    }
    public void setToDateOfService(LocalDate toDateOfService) {
        this.toDateOfService = toDateOfService;
    }

    // Getter and Setter for procedureCode
    public String getProcedureCode() {
        return procedureCode;
    }
    public void setProcedureCode(String procedureCode) {
        this.procedureCode = procedureCode;
    }

    // Getter and Setter for drugName
    public String getDrugName() {
        return drugName;
    }
    public void setDrugName(String drugName) {
        this.drugName = drugName;
    }

    // Getter and Setter for drugType
    public String getDrugType() {
        return drugType;
    }
    public void setDrugType(String drugType) {
        this.drugType = drugType;
    }

    // Getter and Setter for drugQuantity
    public String getDrugQuantity() {
        return drugQuantity;
    }
    public void setDrugQuantity(String drugQuantity) {
        this.drugQuantity = drugQuantity;
    }

    // Getter and Setter for noOfChemo
    public String getNoOfChemo() {
        return noOfChemo;
    }
    public void setNoOfChemo(String noOfChemo) {
        this.noOfChemo = noOfChemo;
    }

    // Getter and Setter for requestType
    public String getRequestType() {
        return requestType;
    }
    public void setRequestType(String requestType) {
        this.requestType = requestType;
    }


      // Getter and Setter for drugamtdispensed
      public String getDrugamtdispensed() {
        return drugamtdispensed;
    }

    public void setDrugamtdispensed(String drugamtdispensed) {
        this.drugamtdispensed = drugamtdispensed;
    }

    // Getter and Setter for drugamtdispensedType
    public String getDrugamtdispensedType() {
        return drugamtdispensedType;
    }

    public void setDrugamtdispensedType(String drugamtdispensedType) {
        this.drugamtdispensedType = drugamtdispensedType;
    }

    // Getter and Setter for precertificationType
    public String getPrecertificationType() {
        return precertificationType;
    }

    public void setPrecertificationType(String precertificationType) {
        this.precertificationType = precertificationType;
    }

    public String getDrugDescription() {
        return drugDescription;
    }
    
    public void setDrugDescription(String drugDescription) {
        this.drugDescription = drugDescription;
    }

    public String getIcdCode() {
        return icdCode;
    }
    
    public void setIcdCode(String icdCode) {
        this.icdCode = icdCode;
    }

    
    // Getters and setters
    public List<IcdEntity> getIcdCodes() {
        return icdCodes;
    }

    public void setIcdCodes(List<IcdEntity> icdCodes) {
        this.icdCodes = icdCodes;
    }

    public List<CptOrProcedureEntity> getCptCodes() {
        return cptCodes;
    }

    public void setCptCodes(List<CptOrProcedureEntity> cptCodes) {
        this.cptCodes = cptCodes;
    }

    // Helper methods to maintain bidirectional relationship
    public void addIcdCode(IcdEntity icd) {
        icdCodes.add(icd);
        icd.setDrug(this);
    }

    public void removeIcdCode(IcdEntity icd) {
        icdCodes.remove(icd);
        icd.setDrug(null);
    }

    public void addCptCode(CptOrProcedureEntity cpt) {
        cptCodes.add(cpt);
        cpt.setDrug(this);
    }

    public void removeCptCode(CptOrProcedureEntity cpt) {
        cptCodes.remove(cpt);
        cpt.setDrug(null);
    }
}
