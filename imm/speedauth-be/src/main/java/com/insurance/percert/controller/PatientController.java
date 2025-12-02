package com.insurance.percert.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.percert.Repository.PatientRepository;
import com.insurance.percert.model.PatientEntity;
import com.insurance.percert.model.PatientSummaryDTO;
import com.insurance.percert.service.PatientService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("patient")
@CrossOrigin(origins = "*") // Replace with your frontend URL
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private PatientRepository patientRepository;

    @PostMapping("/write")
    public PatientEntity createPatientData(@RequestBody PatientEntity patientEntity) {
        PatientEntity addData = patientService.createPatientData(patientEntity);
        return addData;

    }
    // @PostMapping("/write")
    // public ResponseEntity<PatientEntity> createPatientData(@RequestBody
    // PatientEntity patientEntity){
    // PatientEntity addData = patientService.createPatientData(patientEntity);
    // return new ResponseEntity<PatientEntity>(addData, HttpStatus.CREATED);
    // }

    @GetMapping("/read")
    public ResponseEntity<List<PatientEntity>> getAllPatientDetails() {
        List<PatientEntity> getallpatientdetails = patientService.getAllPatientDetails();
        return new ResponseEntity<List<PatientEntity>>(getallpatientdetails, HttpStatus.OK);
    }

    @GetMapping("/read/{id}")
    public ResponseEntity<PatientEntity> getPatientById(@PathVariable Long id) {
        PatientEntity getpatientbyId = patientService.getPatientById(id);
        return new ResponseEntity<PatientEntity>(getpatientbyId, HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<PatientEntity> updatePatientDetails(@PathVariable Long id,
            @RequestBody PatientEntity PatientEntity) {
        PatientEntity updatepatientdetails = patientService.updatePatientDetails(id, PatientEntity);
        return new ResponseEntity<PatientEntity>(updatepatientdetails, HttpStatus.OK);
    }

    @PutMapping("/edit/{patientId}")
    public ResponseEntity<PatientEntity> updatePatientDetailsByPatientId(@PathVariable Long patientId,
            @RequestBody PatientEntity PatientEntity) {
        PatientEntity updatepatientdetails = patientService.updatePatientDetailsByPatientId(patientId, PatientEntity);
        return new ResponseEntity<PatientEntity>(updatepatientdetails, HttpStatus.OK);
    }

    @PutMapping("/editpatient")
    public ResponseEntity<PatientEntity> updatePatientDetailsByCustomPatientId(@RequestParam String customPatientId,
            @RequestBody PatientEntity PatientEntity) {
        PatientEntity updatepatientdetails = patientService.updatePatientDetailsByCustomPatientId(customPatientId,
                PatientEntity);
        return new ResponseEntity<PatientEntity>(updatepatientdetails, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deletePatientDetails(@PathVariable Long id) {
        patientService.deletePatientDetails(id);
        return new ResponseEntity<String>("Deleted Recording Successfully..!!", HttpStatus.OK);
    }

    @GetMapping("/{uniquePatientNumber}")
    public ResponseEntity<PatientEntity> getPatientByUniqueId(@PathVariable String uniquePatientNumber) {
        Optional<PatientEntity> patient = patientService.getPatientByUniqueId(uniquePatientNumber);
        System.out.println("data" + patient);
        return patient.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // @GetMapping("/search")
    // public ResponseEntity<List<PatientEntity>> searchPatients(@RequestParam("query") String query) {
    //     List<PatientEntity> patients = patientService.searchPatientsByName(query);
    //     return ResponseEntity.ok(patients);
    // }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchPatients(@RequestParam("query") String query) {
        List<PatientEntity> patients = patientService.searchPatientsByName(query);
    
        List<PatientSummaryDTO> summaryList = patients.stream()
            .map(p -> new PatientSummaryDTO(p.getCustomPatientId(), p.getFullName()))
            .toList();
    
        if (summaryList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No data found");
        }
    
        return ResponseEntity.ok(summaryList);
    }
    

}

