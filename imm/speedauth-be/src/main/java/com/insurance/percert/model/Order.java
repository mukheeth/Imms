package com.insurance.percert.model;

import java.time.LocalDate;
import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders_details")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @Column(nullable = false)
    private Date orderDate;

    @Column(nullable = false)
    private LocalDate fromDateOfService;

    @Column(nullable = false)
    private LocalDate toDateOfService;

    @Column(nullable = false)
    private String orderType;

    private String orderDescription;

    private String orderPriority;

    private String orderIcdCode;

    private String orderCptCode;

    // Map explicitly to the existing PostgreSQL column "orderjcode"
    // (lowercase, from the original MySQL schema). Without this,
    // Hibernate tries to use "orderJCode", which does not exist.
    @Column(name = "orderjcode")
    private String orderJCode;

    private String orderStatus;

    private int units;
    private String uniquepatientI;
    private String providerNpiNumber;
    private String insuranceId;
    private String providerName;

    private String icddrugname;
    private String icddrugdescription;
    private String icddrugamtdispensed;
    private String icddrugamtdispensedType;

    private String icdnumberofchempresent;
    private String icddrugType;
    private String icddrugunits;
    // it is like precertificationtype in patient no like that
    // private String requestType;
    private String precertificationType;

    private boolean deletedStatus;

    // @ManyToOne
    // @JoinColumn(name = "provider_npi", referencedColumnName = "npiNumber",
    // nullable = false)
    // private ProviderEntity provider;

    // @ManyToOne
    // @JoinColumn(name = "provider_id", nullable = false)
    // private ProviderEntity provider;

    // @ManyToOne
    // @JoinColumn(name = "patient_id", nullable = false)
    // private PatientEntity patient;

    // @ManyToOne
    // @JoinColumn(name = "custom_patient_id", referencedColumnName =
    // "customPatientId", nullable = false)
    // private PatientEntity customPatientId;


    //getters and setteres starts here

    public Long getOrderId() {
        return orderId;
    }
    
    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }
    
    public Date getOrderDate() {
        return orderDate;
    }
    
    public void setOrderDate(Date orderDate) {
        this.orderDate = orderDate;
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
    
    public String getOrderType() {
        return orderType;
    }
    
    public void setOrderType(String orderType) {
        this.orderType = orderType;
    }
    
    public String getOrderDescription() {
        return orderDescription;
    }
    
    public void setOrderDescription(String orderDescription) {
        this.orderDescription = orderDescription;
    }
    
    public String getOrderPriority() {
        return orderPriority;
    }
    
    public void setOrderPriority(String orderPriority) {
        this.orderPriority = orderPriority;
    }
    
    public String getOrderIcdCode() {
        return orderIcdCode;
    }
    
    public void setOrderIcdCode(String orderIcdCode) {
        this.orderIcdCode = orderIcdCode;
    }
    
    public String getOrderCptCode() {
        return orderCptCode;
    }
    
    public void setOrderCptCode(String orderCptCode) {
        this.orderCptCode = orderCptCode;
    }
    
    public String getOrderJCode() {
        return orderJCode;
    }
    
    public void setOrderJCode(String orderJCode) {
        this.orderJCode = orderJCode;
    }
    
    public String getOrderStatus() {
        return orderStatus;
    }
    
    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }
    
    public int getUnits() {
        return units;
    }
    
    public void setUnits(int units) {
        this.units = units;
    }
    
    public String getUniquepatientI() {
        return uniquepatientI;
    }
    
    public void setUniquepatientI(String uniquepatientI) {
        this.uniquepatientI = uniquepatientI;
    }
    
    public String getProviderNpiNumber() {
        return providerNpiNumber;
    }
    
    public void setProviderNpiNumber(String providerNpiNumber) {
        this.providerNpiNumber = providerNpiNumber;
    }
    
    public String getInsuranceId() {
        return insuranceId;
    }
    
    public void setInsuranceId(String insuranceId) {
        this.insuranceId = insuranceId;
    }
    
    public String getProviderName() {
        return providerName;
    }
    
    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }
    
    public String getIcddrugname() {
        return icddrugname;
    }
    
    public void setIcddrugname(String icddrugname) {
        this.icddrugname = icddrugname;
    }
    
    public String getIcddrugdescription() {
        return icddrugdescription;
    }
    
    public void setIcddrugdescription(String icddrugdescription) {
        this.icddrugdescription = icddrugdescription;
    }
    
    public String getIcddrugamtdispensed() {
        return icddrugamtdispensed;
    }
    
    public void setIcddrugamtdispensed(String icddrugamtdispensed) {
        this.icddrugamtdispensed = icddrugamtdispensed;
    }
    
    public String getIcddrugamtdispensedType() {
        return icddrugamtdispensedType;
    }
    
    public void setIcddrugamtdispensedType(String icddrugamtdispensedType) {
        this.icddrugamtdispensedType = icddrugamtdispensedType;
    }
    
    public String getIcdnumberofchempresent() {
        return icdnumberofchempresent;
    }
    
    public void setIcdnumberofchempresent(String icdnumberofchempresent) {
        this.icdnumberofchempresent = icdnumberofchempresent;
    }
    
    public String getIcddrugType() {
        return icddrugType;
    }
    
    public void setIcddrugType(String icddrugType) {
        this.icddrugType = icddrugType;
    }
    
    public String getIcddrugunits() {
        return icddrugunits;
    }
    
    public void setIcddrugunits(String icddrugunits) {
        this.icddrugunits = icddrugunits;
    }
    
    public String getPrecertificationType() {
        return precertificationType;
    }
    
    public void setPrecertificationType(String precertificationType) {
        this.precertificationType = precertificationType;
    }
    
    public boolean isDeletedStatus() {
        return deletedStatus;
    }
    
    public void setDeletedStatus(boolean deletedStatus) {
        this.deletedStatus = deletedStatus;
    }
    

}
