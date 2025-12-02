package com.insurance.percert.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProviderSummaryDTO {
    private String npiNumber;
    private String providerName;
}
