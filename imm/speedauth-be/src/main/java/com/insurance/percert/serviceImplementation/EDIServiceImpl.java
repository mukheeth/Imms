package com.insurance.percert.serviceImplementation;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.insurance.percert.Repository.EDIRepo;
import com.insurance.percert.model.Authorization;
import com.insurance.percert.model.EDIEntity;
import com.insurance.percert.model.Insurance;
import com.insurance.percert.model.PatientEntity;
import com.insurance.percert.model.ProviderEntity;
import com.insurance.percert.service.EDIService;

@Service
public class EDIServiceImpl implements EDIService {
    @Autowired
    private EDIRepo ediRepository;

   
    private String getFormattedDate() {
        return java.time.LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    }

    @Override
    public EDIEntity saveEDI(EDIEntity ediEntity) {
        return ediRepository.save(ediEntity);
    }

    @Override
    public List<EDIEntity> getAllEDIs() {
        return ediRepository.findAll();
    }

    @Override
    public Optional<EDIEntity> getEDIById(Long id) {
        return ediRepository.findById(id);
    }

    @Override
    public List<EDIEntity> getEDIByTransactionId(String transactionId) {
        return ediRepository.findByTransactionId(transactionId);
    }

    @Override
    public EDIEntity updateEDI(Long id, EDIEntity ediEntity) {
        return ediRepository.findById(id)
                .map(existingEDI -> {
                    existingEDI.setTransactionId(ediEntity.getTransactionId());
                    existingEDI.setTransactionType(ediEntity.getTransactionType());
                    existingEDI.setDocumentContent(ediEntity.getDocumentContent());
                    existingEDI.setCreatedAt(ediEntity.getCreatedAt());
                    existingEDI.setReceiverId(ediEntity.getReceiverId());
                    return ediRepository.save(existingEDI);
                })
                .orElseThrow(() -> new RuntimeException("EDI not found with id: " + id));
    }

    @Override
    public void deleteEDI(Long id) {
        ediRepository.deleteById(id);
    }

    // public String generateEDIFile(Authorization authorization, String fileNameSuffix) throws IOException {
    //     // Define the EDI file path using authorization ID and file name suffix
    //     String ediFilePath = "authorization_edi_" + authorization.getAuthorizationId() + "_" + fileNameSuffix
    //             + "_278.edi";

    //     // Create and open the file for writing
    //     File ediFile = new File(ediFilePath);
    //     BufferedWriter writer = new BufferedWriter(new FileWriter(ediFile));

    //     // Segment Counter
    //     int segmentCount = 0;

    //     // ISA Segment: Interchange Control Header
    //     writer.write("ISA*00*          *00*          *ZZ*YOURGSID      *ZZ*INSURANCE       *"
    //             + getFormattedDate() + "*00501*000000001*1*P*:"); // Modify as needed
    //     writer.newLine();
    //     segmentCount++;

    //     // GS Segment: Functional Group Header
    //     writer.write("GS*HS*YOURGSID*INSURANCE*"
    //             + getFormattedDate() + "*0001*X*005010X217");
    //     writer.newLine();
    //     segmentCount++;

    //     // ST Segment: Transaction Set Header
    //     writer.write("ST*278*0001");
    //     writer.newLine();
    //     segmentCount++;

    //     // BHT Segment: Beginning of Hierarchical Transaction
    //     writer.write("BHT*0010*13*AUTHORIZATION_ID*" + getFormattedDate() + "*123456*CH");
    //     writer.newLine();
    //     segmentCount++;

    //     // NM1 Segment: Patient Name
    //     PatientEntity patient = authorization.getPatient();
    //     writer.write("NM1*IL*1*" + patient.getFullName() + "****MI*" + patient.getCustomPatientId());
    //     writer.newLine();
    //     segmentCount++;

    //     // HL Segment: Hierarchical Level
    //     writer.write("HL*1**20*1");
    //     writer.newLine();
    //     segmentCount++;

    //     // PAT Segment: Patient Information
    //     writer.write("PAT*A*MI*" + patient.getDateOfBirth().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
    //             + "*");
    //     writer.newLine();
    //     segmentCount++;

    //     // Procedure Information: HI Segment
    //     writer.write("HI*ABK:" + authorization.getIcdCodeAuth());
    //     writer.newLine();
    //     segmentCount++;

    //     // Service Line: SV1 Segment
    //     writer.write("SV1*HC:" + authorization.getProcedureCodeAuth() + "*100*UN");
    //     writer.newLine();
    //     segmentCount++;

    //     // Provider Details: NM1 Segment
    //     ProviderEntity provider = authorization.getProvider();
    //     writer.write("NM1*85*2*" + provider.getProviderName() + "****XX*" + provider.getProviderId());
    //     writer.newLine();
    //     segmentCount++;

    //     // Insurance Details: NM1 Segment
    //     Insurance insurance = authorization.getInsurance();
    //     writer.write("NM1*PR*2*" + insurance.getName());
    //     writer.newLine();
    //     segmentCount++;

    //     // SE Segment: Transaction Set Trailer
    //     writer.write("SE*" + segmentCount + "*0001");
    //     writer.newLine();

    //     // GE Segment: Functional Group Trailer
    //     writer.write("GE*1*0001");
    //     writer.newLine();

    //     // IEA Segment: Interchange Control Trailer
    //     writer.write("IEA*1*000000001");
    //     writer.newLine();

    //     writer.close();

    //     return ediFilePath;
    // }

    // public String generateEDIFile(Authorization authorization, String fileNameSuffix) throws IOException {
    //     // Define the EDI file path using authorization ID and file name suffix
    //     String ediFilePath = "authorization_edi_" + authorization.getAuthorizationId() + "_" + fileNameSuffix + "_278.edi";
    
    //     // Create and open the file for writing
    //     File ediFile = new File(ediFilePath);
    //     BufferedWriter writer = new BufferedWriter(new FileWriter(ediFile));
    
    //     // Segment Counter
    //     int segmentCount = 0;
    
    //     // ISA Segment: Interchange Control Header
    //     writer.write("ISA*00*          *00*          *ZZ*YOURGSID      *ZZ*INSURANCE       *"
    //             + getFormattedDate() + "*00501*000000001*1*P*:"); // Modify as needed
    //     writer.newLine();
    //     segmentCount++;
    
    //     // GS Segment: Functional Group Header
    //     writer.write("GS*HS*YOURGSID*INSURANCE*"
    //             + getFormattedDate() + "*0001*X*005010X217");
    //     writer.newLine();
    //     segmentCount++;
    
    //     // ST Segment: Transaction Set Header
    //     writer.write("ST*278*0001");
    //     writer.newLine();
    //     segmentCount++;
    
    //     // BHT Segment: Beginning of Hierarchical Transaction
    //     writer.write("BHT*0010*13*AUTHORIZATION_ID*" + getFormattedDate() + "*123456*CH");
    //     writer.newLine();
    //     segmentCount++;
    
    //     // NM1 Segment: Patient Name
    //     PatientEntity patient = authorization.getPatient();
    //     writer.write("NM1*IL*1*" + patient.getFullName() + "****MI*" + patient.getCustomPatientId());
    //     writer.newLine();
    //     segmentCount++;
    
    //     // HL Segment: Hierarchical Level
    //     writer.write("HL*1**20*1");
    //     writer.newLine();
    //     segmentCount++;
    
    //     // PAT Segment: Patient Information
    //     writer.write("PAT*A*MI*" + patient.getDateOfBirth().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
    //             + "*");
    //     writer.newLine();
    //     segmentCount++;
    
    //     // Procedure Information: HI Segment
    //     writer.write("HI*ABK:" + authorization.getIcdCodeAuth());
    //     writer.newLine();
    //     segmentCount++;
    
    //     // Service Line: SV1 Segment
    //     writer.write("SV1*HC:" + authorization.getProcedureCodeAuth() + "*100*UN");
    //     writer.newLine();
    //     segmentCount++;
    
    //     // Provider Details: NM1 Segment
    //     ProviderEntity provider = authorization.getProvider();
    //     writer.write("NM1*85*2*" + provider.getProviderName() + "****XX*" + provider.getProviderId());
    //     writer.newLine();
    //     segmentCount++;
    
    //     // Insurance Details: NM1 Segment
    //     Insurance insurance = authorization.getInsurance();
    //     writer.write("NM1*PR*2*" + insurance.getName());
    //     writer.newLine();
    //     segmentCount++;
    
    //     // SE Segment: Transaction Set Trailer
    //     writer.write("SE*" + segmentCount + "*0001");
    //     writer.newLine();
    
    //     // GE Segment: Functional Group Trailer
    //     writer.write("GE*1*0001");
    //     writer.newLine();
    
    //     // IEA Segment: Interchange Control Trailer
    //     writer.write("IEA*1*000000001");
    //     writer.newLine();
    
    //     writer.close();
    
    //     // Save the EDI details in the database
    //     EDIEntity ediEntity = new EDIEntity();
    //     ediEntity.setTransactionId("AUTH-" + authorization.getAuthorizationId());
    //     ediEntity.setTransactionType("278");
    //     ediEntity.setDocumentContent(ediFilePath); // Save file path in DB
    //     ediEntity.setCreatedAt(java.time.LocalDateTime.now());
    //     ediEntity.setReceiverId("Receiver-ID"); // You can modify this as needed
    
    //     ediRepository.save(ediEntity); // Persist to the database
    
    //     return ediFilePath;
    // }


     
    public String generateEDIFile(Authorization authorization, String fileNameSuffix) throws IOException {
        // Define the EDI file path using authorization ID and file name suffix
        String ediFilePath = "authorization_edi_" + authorization.getAuthorizationId() + "_" + fileNameSuffix
                + "_278.edi";
 
        // Create and open the file for writing
        File ediFile = new File(ediFilePath);
        BufferedWriter writer = new BufferedWriter(new FileWriter(ediFile));
 
        // Segment Counter
        int segmentCount = 0;
 
        // ISA Segment: Interchange Control Header
        writer.write("ISA*00*          *00*          *ZZ*YOURGSID      *ZZ*INSURANCE       *"
                + getFormattedDate() + "*00501*000000001*1*P*:"); // Modify as needed
        writer.newLine();
        segmentCount++;
 
        // GS Segment: Functional Group Header
        writer.write("GS*HS*YOURGSID*INSURANCE*"
                + getFormattedDate() + "*0001*X*005010X217");
        writer.newLine();
        segmentCount++;
 
        // ST Segment: Transaction Set Header
        writer.write("ST*278*0001");
        writer.newLine();
        segmentCount++;
 
        // BHT Segment: Beginning of Hierarchical Transaction
        writer.write("BHT*0010*13*AUTHORIZATION_ID*" + getFormattedDate() + "*123456*CH");
        writer.newLine();
        segmentCount++;
 
        // NM1 Segment: Patient Name
        PatientEntity patient = authorization.getPatient();
        writer.write("NM1*IL*1*" + patient.getFullName() + "****MI*" + patient.getCustomPatientId());
        writer.newLine();
        segmentCount++;
 
        // HL Segment: Hierarchical Level
        writer.write("HL*1**20*1");
        writer.newLine();
        segmentCount++;
 
        // PAT Segment: Patient Information
        writer.write("PAT*A*MI*" + patient.getDateOfBirth().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "*");
        writer.newLine();
        segmentCount++;
 
        // Procedure Information: HI Segment
        writer.write("HI*ABK:" + authorization.getIcdCodeAuth());
        writer.newLine();
        segmentCount++;
 
        // Service Line: SV1 Segment
        writer.write("SV1*HC:" + authorization.getProcedureCodeAuth() + "*100*UN");
        writer.newLine();
        segmentCount++;
 
        // Provider Details: NM1 Segment
        ProviderEntity provider = authorization.getProvider();
        writer.write("NM1*85*2*" + provider.getProviderName() + "****XX*" + provider.getProviderId());
        writer.newLine();
        segmentCount++;
 
        // Insurance Details: NM1 Segment
        Insurance insurance = authorization.getInsurance();
        writer.write("NM1*PR*2*" + insurance.getName());
        writer.newLine();
        segmentCount++;
 
        // SE Segment: Transaction Set Trailer
        writer.write("SE*" + segmentCount + "*0001");
        writer.newLine();
 
        // GE Segment: Functional Group Trailer
        writer.write("GE*1*0001");
        writer.newLine();
 
        // IEA Segment: Interchange Control Trailer
        writer.write("IEA*1*000000001");
        writer.newLine();
 
        writer.close();
 
        return ediFilePath;
    }
 

}
