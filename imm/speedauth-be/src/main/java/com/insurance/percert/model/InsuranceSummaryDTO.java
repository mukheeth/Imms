package com.insurance.percert.model;

public class InsuranceSummaryDTO {
    

    private String customInsuranceId;
    private String payerName;

    public InsuranceSummaryDTO(String customInsuranceId, String payerName) {
        this.customInsuranceId = customInsuranceId;
        this.payerName = payerName;
    }

    // getters & setters
    public String getCustomInsuranceId() { return customInsuranceId; }
    public void setCustomInsuranceId(String id) { this.customInsuranceId = id; }

    public String getPayerName() { return payerName; }
    public void setPayerName(String name) { this.payerName = name; }
}
