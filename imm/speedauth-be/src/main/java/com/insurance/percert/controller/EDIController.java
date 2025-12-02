package com.insurance.percert.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.insurance.percert.model.Authorization;
import com.insurance.percert.model.EDIEntity;
import com.insurance.percert.model.PatientEntity;
import com.insurance.percert.service.AuthorizationService;
import com.insurance.percert.service.EDIService;
import com.insurance.percert.service.PatientService;
import org.springframework.http.MediaType;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/edi")
@CrossOrigin(origins = "*")
public class EDIController {

    @Autowired
    private EDIService ediService;

    @Autowired
    private PatientService patientService;
    @Autowired
    private AuthorizationService authservice;

    // @GetMapping("/generate-edi/{authId}")
    // public String generateEDI(@PathVariable long authId) throws IOException {
    //     // Fetch patient details from the database (simulated here for simplicity)
    //     Authorization authEntity = authservice.getAuthorizationById(authId);

    //     // Generate EDI file for the patient
    //     String ediFilePath = ediService.generateEDIFile(authEntity, "original");

    //     // Return the file path or success message
    //     return "EDI file generated successfully at: " + ediFilePath;
    // }
    // @GetMapping("/generate-edi/{authId}")
    // public ResponseEntity<EDIEntity> generateEDI(@PathVariable long authId) throws IOException {
    //     // Fetch authorization details
    //     Authorization authEntity = authservice.getAuthorizationById(authId);
    
    //     // Generate EDI file and save details in DB
    //     String ediFilePath = ediService.generateEDIFile(authEntity, "hold");
    
    //     // Retrieve the saved EDI record from the database
    //     List<EDIEntity> ediEntities = ediService.getEDIByTransactionId("AUTH-" + authEntity.getAuthorizationId());
    
    //     if (!ediEntities.isEmpty()) {
    //         return ResponseEntity.ok(ediEntities.get(0)); // Return the latest generated record
    //     } else {
    //         return ResponseEntity.notFound().build();
    //     }
    // }

     @GetMapping("/generate-edi/{authId}")
    public ResponseEntity<String> generateEDI(@PathVariable long authId) throws IOException {
        // Fetch patient details from the database (simulated here for simplicity)
        Authorization authEntity = authservice.getAuthorizationById(authId);
 
        // Generate EDI file for the patient
        String ediFilePath = ediService.generateEDIFile(authEntity, "original");
 
        // Read the content of the generated EDI file
        File ediFile = new File(ediFilePath);
        StringBuilder ediContent = new StringBuilder();
 
        try (BufferedReader reader = new BufferedReader(new FileReader(ediFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                ediContent.append(line).append("\n");
            }
        }
 
        // Return the EDI content as the response
        return ResponseEntity.ok(ediContent.toString());
    }
    
    // private PatientEntity fetchPatientById(long patientId) {
    // // This is a mock method to simulate fetching patient by ID. Replace with
    // actual database call.
    // return new PatientEntity(patientId, "12345", "John", "Doe", "John Doe",
    // java.time.LocalDate.of(1985, 12, 15),
    // "M", "Primary Insurance", "Secondary Insurance", "123456789", "987654321",
    // "123-456-7890", "ABC123", "Healthcare Facility");
    // }

    @PostMapping
    public ResponseEntity<EDIEntity> createEDI(@RequestBody EDIEntity ediEntity) {
        return ResponseEntity.ok(ediService.saveEDI(ediEntity));
    }

    @GetMapping
    public ResponseEntity<List<EDIEntity>> getAllEDIs() {
        return ResponseEntity.ok(ediService.getAllEDIs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EDIEntity> getEDIById(@PathVariable Long id) {
        Optional<EDIEntity> edi = ediService.getEDIById(id);
        return edi.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<List<EDIEntity>> getEDIByTransactionId(@PathVariable String transactionId) {
        return ResponseEntity.ok(ediService.getEDIByTransactionId(transactionId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EDIEntity> updateEDI(@PathVariable Long id, @RequestBody EDIEntity ediEntity) {
        return ResponseEntity.ok(ediService.updateEDI(id, ediEntity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEDI(@PathVariable Long id) {
        ediService.deleteEDI(id);
        return ResponseEntity.noContent().build();
    }

}
