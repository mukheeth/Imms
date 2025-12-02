package com.insurance.percert.model;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PatientSummaryDTO {

    private String customPatientId;
    private String fullName;
    
}
