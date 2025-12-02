package com.insurance.percert.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.percert.Repository.PatientRepository;
import com.insurance.percert.model.ProviderEntity;
import com.insurance.percert.model.ProviderSummaryDTO;
import com.insurance.percert.service.ProviderService;

@RestController
@RequestMapping("provider")
@CrossOrigin(origins = "*") // Replace with your frontend URL
public class ProviderController {

    @Autowired
    private ProviderService providerService;

    @Autowired
    private PatientRepository patientRepository;

    @PostMapping("/write")
    public ProviderEntity createProviderData(@RequestBody ProviderEntity patientEntity) {
        ProviderEntity addData = providerService.createProviderData(patientEntity);
        return addData;

    }
    // @PostMapping("/write")
    // public ResponseEntity<ProviderEntity> createPatientData(@RequestBody
    // ProviderEntity patientEntity){
    // ProviderEntity addData = providerService.createPatientData(patientEntity);
    // return new ResponseEntity<ProviderEntity>(addData, HttpStatus.CREATED);
    // }

    @GetMapping("/read")
    public ResponseEntity<List<ProviderEntity>> getAllProviderDetails() {
        List<ProviderEntity> getallproviderdetails = providerService.getAllProviderDetails();
        return new ResponseEntity<List<ProviderEntity>>(getallproviderdetails, HttpStatus.OK);
    }

    @GetMapping("/read/{id}")
    public ResponseEntity<ProviderEntity> getProviderById(@PathVariable Long id) {
        ProviderEntity getproviderbyId = providerService.getProviderById(id);
        return new ResponseEntity<ProviderEntity>(getproviderbyId, HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ProviderEntity> updateProviderDetails(@PathVariable Long id,
            @RequestBody ProviderEntity ProviderEntity) {
        ProviderEntity updatepatientdetails = providerService.updateProviderDetails(id, ProviderEntity);
        return new ResponseEntity<ProviderEntity>(updatepatientdetails, HttpStatus.OK);
    }

    @PutMapping("/edit/{npiNumber}")
    public ResponseEntity<ProviderEntity> updateProviderDetailsByNpi(@PathVariable String npiNumber,
            @RequestBody ProviderEntity ProviderEntity) {
        ProviderEntity updatepatientdetails = providerService.updateProviderDetailsByNpi(npiNumber, ProviderEntity);
        return new ResponseEntity<ProviderEntity>(updatepatientdetails, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteProviderDetails(@PathVariable Long id) {
        providerService.deleteProviderDetails(id);
        return new ResponseEntity<String>("Deleted Recording Successfully..!!", HttpStatus.OK);
    }

    @GetMapping("/{npiNumber}")
    public ResponseEntity<ProviderEntity> getProviderByNpiNumber(@PathVariable String npiNumber) {
        Optional<ProviderEntity> provider = providerService.getProviderByNpiNumber(npiNumber);
        return provider.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/by-name")
    public ResponseEntity<ProviderEntity> getProviderByProviderName(@RequestParam String providerName) {
        System.out.println("hiiiii");
        System.out.println("Received provider name: '" + providerName + "'");
        
        ProviderEntity provider = providerService.getProviderByProviderName(providerName);
        
        if (provider == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(provider);
    }
    
    @GetMapping()
    public ResponseEntity<?> getUniqueProviderByNpiNumber(@RequestParam String npiNumber) {
        ProviderEntity provider = providerService.getUniqueProviderByNpiNumber(npiNumber);
        if (provider != null) {
            return ResponseEntity.ok().body(provider);
        } else {
            return ResponseEntity.badRequest().body("provider notfound");
        }

    }


    @GetMapping("/search")
    public ResponseEntity<?> searchProviders(@RequestParam("query") String query) {
        List<ProviderEntity> providers = providerService.searchProvidersByName(query);

        List<ProviderSummaryDTO> summaryList = providers.stream()
            .map(p -> new ProviderSummaryDTO(p.getNpiNumber(), p.getProviderName()))
            .collect(Collectors.toList());

        if (summaryList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No providers found");
        }

        return ResponseEntity.ok(summaryList);
    }

}
