package com.insurance.percert.model;

import java.time.LocalDate;
import java.util.ArrayList;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.*;
@Data
@Table(name = "patient_details")
@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PatientEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patient_id")
    private long patientId;

    @Column(name = "custom_patient_id", unique = true)
    private String customPatientId;
    
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    @Column(name = "full_name")
    private String fullName;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "gender")
    private String gender;
    
    @Column(name = "primary_insurance")
    private String primaryInsurance;
    
    @Column(name = "secondary_insurance")
    private String secondaryInsurance;
    
    @Column(name = "primary_policy_number")
    private String primaryPolicyNumber;
    
    @Column(name = "secondary_policy_number")
    private String secondaryPolicyNumber;
    
    @Column(name = "contact_number")
    private String contactNumber;
    
    @Column(name = "insurance_id")
    private String insuranceId;
    
    @Column(name = "facility_name")
    private String facilityName;
    
    @Column(name = "facility_address")
    private String facilityAddress;
    
    @Column(name = "icd_code")
    private String icdCode;
    
    @Column(name = "procedure_code")
    private String procedureCode;
    
    @Column(name = "date_of_service")
    private String dateOfService;
    
    @Column(name = "from_date_of_service")
    private LocalDate fromDateOfService;
    
    @Column(name = "to_date_of_service")
    private LocalDate toDateOfService;
    
    @Column(name = "precertification_type")
    private String precertificationType;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "subscriber_id")
    private String subscriberId;


    // @OneToMany(mappedBy = "patient")
    // private List<Order> orders;

    // @OneToMany(mappedBy = "customPatientId")
    // private List<Order> orders;


    @OneToMany(mappedBy = "patient" )
    @JsonManagedReference
    private List<FileEntity> files = new ArrayList<>();


    public long getPatientId() {
        return patientId;
    }
    
    public void setPatientId(long patientId) {
        this.patientId = patientId;
    }
    
    public String getCustomPatientId() {
        return customPatientId;
    }
    
    public void setCustomPatientId(String customPatientId) {
        this.customPatientId = customPatientId;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }
    
    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
    
    public String getGender() {
        return gender;
    }
    
    public void setGender(String gender) {
        this.gender = gender;
    }
    
    public String getPrimaryInsurance() {
        return primaryInsurance;
    }
    
    public void setPrimaryInsurance(String primaryInsurance) {
        this.primaryInsurance = primaryInsurance;
    }
    
    public String getSecondaryInsurance() {
        return secondaryInsurance;
    }
    
    public void setSecondaryInsurance(String secondaryInsurance) {
        this.secondaryInsurance = secondaryInsurance;
    }
    
    public String getPrimaryPolicyNumber() {
        return primaryPolicyNumber;
    }
    
    public void setPrimaryPolicyNumber(String primaryPolicyNumber) {
        this.primaryPolicyNumber = primaryPolicyNumber;
    }
    
    public String getSecondaryPolicyNumber() {
        return secondaryPolicyNumber;
    }
    
    public void setSecondaryPolicyNumber(String secondaryPolicyNumber) {
        this.secondaryPolicyNumber = secondaryPolicyNumber;
    }
    
    public String getContactNumber() {
        return contactNumber;
    }
    
    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }
    
    public String getInsuranceId() {
        return insuranceId;
    }
    
    public void setInsuranceId(String insuranceId) {
        this.insuranceId = insuranceId;
    }
    
    public String getFacilityName() {
        return facilityName;
    }
    
    public void setFacilityName(String facilityName) {
        this.facilityName = facilityName;
    }
    
    public String getFacilityAddress() {
        return facilityAddress;
    }
    
    public void setFacilityAddress(String facilityAddress) {
        this.facilityAddress = facilityAddress;
    }
    
    public String getIcdCode() {
        return icdCode;
    }
    
    public void setIcdCode(String icdCode) {
        this.icdCode = icdCode;
    }
    
    public String getProcedureCode() {
        return procedureCode;
    }
    
    public void setProcedureCode(String procedureCode) {
        this.procedureCode = procedureCode;
    }
    
    public String getDateOfService() {
        return dateOfService;
    }
    
    public void setDateOfService(String dateOfService) {
        this.dateOfService = dateOfService;
    }
    
    public LocalDate getFromDateOfService() {
        return fromDateOfService;
    }
    
    public void setFromDateOfService(LocalDate fromDateOfService) {
        this.fromDateOfService = fromDateOfService;
    }
    
    public LocalDate getToDateOfService() {
        return toDateOfService;
    }
    
    public void setToDateOfService(LocalDate toDateOfService) {
        this.toDateOfService = toDateOfService;
    }
    
    public String getPrecertificationType() {
        return precertificationType;
    }
    
    public void setPrecertificationType(String precertificationType) {
        this.precertificationType = precertificationType;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getSubscriberId() {
        return subscriberId;
    }
    
    public void setSubscriberId(String subscriberId) {
        this.subscriberId = subscriberId;
    }
    

}
