package com.insurance.percert.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



@Data
@Table(name = "provider_details")
@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ProviderEntity {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name = "provider_id")
    private long providerId;
    
    @Column(name = "provider_name")
    private String providerName;
    
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    @Column(name = "npi_number", unique = true)
    private String npiNumber;
    
    @Column(name = "provider_type")
    private String providerType;
    
    @Column(name = "provider_contact")
    private String providerContact;
    
    @Column(name = "tax_id")
    private String taxId;

    // @Column(unique = true, nullable = false) // Ensure npiNumber is unique
    // private String npiNumber;

    // // Define relationship with Order (one provider can have multiple orders)
    // @OneToMany(mappedBy = "provider")
    // private List<Order> orders;

    // @OneToMany(mappedBy = "provider")
    // private List<Order> orders;

    public long getProviderId() {
        return providerId;
    }
    
    public void setProviderId(long providerId) {
        this.providerId = providerId;
    }
    
    public String getProviderName() {
        return providerName;
    }
    
    public void setProviderName(String providerName) {
        this.providerName = providerName;
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
    
    public String getNpiNumber() {
        return npiNumber;
    }
    
    public void setNpiNumber(String npiNumber) {
        this.npiNumber = npiNumber;
    }
    
    public String getProviderType() {
        return providerType;
    }
    
    public void setProviderType(String providerType) {
        this.providerType = providerType;
    }
    
    public String getProviderContact() {
        return providerContact;
    }
    
    public void setProviderContact(String providerContact) {
        this.providerContact = providerContact;
    }
    
    public String getTaxId() {
        return taxId;
    }
    
    public void setTaxId(String taxId) {
        this.taxId = taxId;
    }
    
}
