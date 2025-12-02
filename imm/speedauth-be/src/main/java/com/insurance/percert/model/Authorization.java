package com.insurance.percert.model;

import java.time.LocalDate;

import org.springframework.web.bind.annotation.CrossOrigin;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "authorization")
@Data
@NoArgsConstructor
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class Authorization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long authorizationId;
    private String requestType;
    private String providerName;
    private String facilityLocation;
    private String icdCodeList;
    private String icdCodeAuth;
    private String procedureCodeAuth;
    private String requestStatus;
    private LocalDate authorizationStartDate;
    private LocalDate authorizationEndDate;
    private Integer units;
    private String description;
    private String claimstatus;
    private String approvalStatus; // "approved" or "rejected"
    private String approvalReason; // Reason for approval or rejection
    private LocalDate approvalDate;
    private LocalDate approvalEndDate;
    private String eligibilityStatus; // "approved" or "rejected"
    private String validationStatus; // "approved" or "rejected"
    private String orderType;
    
    @Column(unique = true)
    private String uniqueAuthId;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = true)
    private PatientEntity patient; // Many Authorizations can belong to one Patient

    @ManyToOne
    @JoinColumn(name = "provider_id", nullable = true)
    private ProviderEntity provider; // Many Authorizations can belong to one Provider

    @ManyToOne
    @JoinColumn(name = "insurance_id", nullable = true)
    private Insurance insurance;

    @ManyToOne
    @JoinColumn(name = "practice_id", nullable = true)
    private Practice practice;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
    private String initialSaveStatus;

      // Getters and Setters
      public Long getAuthorizationId() { return authorizationId; }
      public void setAuthorizationId(Long authorizationId) { this.authorizationId = authorizationId; }
  
      public String getRequestType() { return requestType; }
      public void setRequestType(String requestType) { this.requestType = requestType; }
  
      public String getProviderName() { return providerName; }
      public void setProviderName(String providerName) { this.providerName = providerName; }
  
      public String getFacilityLocation() { return facilityLocation; }
      public void setFacilityLocation(String facilityLocation) { this.facilityLocation = facilityLocation; }
  
      public String getIcdCodeList() { return icdCodeList; }
      public void setIcdCodeList(String icdCodeList) { this.icdCodeList = icdCodeList; }
  
      public String getIcdCodeAuth() { return icdCodeAuth; }
      public void setIcdCodeAuth(String icdCodeAuth) { this.icdCodeAuth = icdCodeAuth; }
  
      public String getProcedureCodeAuth() { return procedureCodeAuth; }
      public void setProcedureCodeAuth(String procedureCodeAuth) { this.procedureCodeAuth = procedureCodeAuth; }
  
      public String getRequestStatus() { return requestStatus; }
      public void setRequestStatus(String requestStatus) { this.requestStatus = requestStatus; }
  
      public LocalDate getAuthorizationStartDate() { return authorizationStartDate; }
      public void setAuthorizationStartDate(LocalDate authorizationStartDate) { this.authorizationStartDate = authorizationStartDate; }
  
      public LocalDate getAuthorizationEndDate() { return authorizationEndDate; }
      public void setAuthorizationEndDate(LocalDate authorizationEndDate) { this.authorizationEndDate = authorizationEndDate; }
  
      public Integer getUnits() { return units; }
      public void setUnits(Integer units) { this.units = units; }
  
      public String getDescription() { return description; }
      public void setDescription(String description) { this.description = description; }
  
      public String getClaimstatus() { return claimstatus; }
      public void setClaimstatus(String claimstatus) { this.claimstatus = claimstatus; }
  
      public String getApprovalStatus() { return approvalStatus; }
      public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
  
      public String getApprovalReason() { return approvalReason; }
      public void setApprovalReason(String approvalReason) { this.approvalReason = approvalReason; }
  
      public LocalDate getApprovalDate() { return approvalDate; }
      public void setApprovalDate(LocalDate approvalDate) { this.approvalDate = approvalDate; }
  
      public LocalDate getApprovalEndDate() { return approvalEndDate; }
      public void setApprovalEndDate(LocalDate approvalEndDate) { this.approvalEndDate = approvalEndDate; }
  
      public String getEligibilityStatus() { return eligibilityStatus; }
      public void setEligibilityStatus(String eligibilityStatus) { this.eligibilityStatus = eligibilityStatus; }
  
      public String getValidationStatus() { return validationStatus; }
      public void setValidationStatus(String validationStatus) { this.validationStatus = validationStatus; }
  
      public String getOrderType() { return orderType; }
      public void setOrderType(String orderType) { this.orderType = orderType; }
  
      public String getUniqueAuthId() { return uniqueAuthId; }
      public void setUniqueAuthId(String uniqueAuthId) { this.uniqueAuthId = uniqueAuthId; }
  
      public PatientEntity getPatient() { return patient; }
      public void setPatient(PatientEntity patient) { this.patient = patient; }
  
      public ProviderEntity getProvider() { return provider; }
      public void setProvider(ProviderEntity provider) { this.provider = provider; }
  
      public Insurance getInsurance() { return insurance; }
      public void setInsurance(Insurance insurance) { this.insurance = insurance; }
  
      public Practice getPractice() { return practice; }
      public void setPractice(Practice practice) { this.practice = practice; }
  
      public Order getOrder() { return order; }
      public void setOrder(Order order) { this.order = order; }

      public String getInitialSaveStatus(){  return initialSaveStatus;  }
      public void setInitialSaveStatus(String initialSaveStatus){ this.initialSaveStatus = initialSaveStatus;  }
}
