package com.insurance.percert.controller;

import com.insurance.percert.model.Insurance;
import com.insurance.percert.model.InsuranceSummaryDTO;
import com.insurance.percert.model.ProviderEntity;
import com.insurance.percert.service.InsuranceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/insurance")
@CrossOrigin(origins="http://localhost:3000")
public class InsuranceController {

    @Autowired
    private InsuranceService insuranceService;

    @GetMapping
    public List<Insurance> getAllInsurances() {
        return insuranceService.getAllInsurances();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Insurance> getInsuranceById(@PathVariable Long id) {
        try {
            Insurance insurance = insuranceService.getInsuranceById(id);
            return ResponseEntity.ok(insurance);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/write")
    public Insurance createInsurance(@RequestBody Insurance insurance) {
        return insuranceService.createInsurance(insurance);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Insurance> updateInsurance(@PathVariable Long id, @RequestBody Insurance insuranceDetails) {
        try {
            Insurance updatedInsurance = insuranceService.updateInsurance(id, insuranceDetails);
            return ResponseEntity.ok(updatedInsurance);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Insurance> updateInsuranceByCustomInsuranceId(
        @RequestParam String customInsuranceId,
        @RequestBody Insurance insuranceDetails) {
        try {
            Insurance updatedInsurance = insuranceService.updateInsuranceByCustomInsuranceId(customInsuranceId, insuranceDetails);
            return ResponseEntity.ok(updatedInsurance);
        } catch (RuntimeException e) {
            System.err.println("Error updating insurance: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/updatebyname")
    public ResponseEntity<Insurance> updateInsuranceByPayerName(
        @RequestParam("name") String name,
        @RequestBody Insurance insuranceDetails) {
        try {
            Insurance updatedInsurance = insuranceService.updateInsuranceByPayerName(name, insuranceDetails);
            return ResponseEntity.ok(updatedInsurance);
        } catch (RuntimeException e) {
            System.err.println("Error updating insurance: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInsurance(@PathVariable Long id) {
        insuranceService.deleteInsurance(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/fetch")
    public ResponseEntity<Insurance> getInsuranceByCustomInsuranceId(@RequestParam String customInsuranceId) {
        Optional<Insurance> insurance = insuranceService.getInsuranceByCustomInsuranceId(customInsuranceId);
        return insurance.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    
    @GetMapping("/fetch/byname")
    public ResponseEntity<Insurance> getInsuranceByName(@RequestParam("name") String name) {
        Optional<Insurance> insurance = insuranceService.getInsuranceByName(name);
        return insurance.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

     @GetMapping("/search")
    public ResponseEntity<?> searchInsurances(@RequestParam("query") String query) {
        List<InsuranceSummaryDTO> list = insuranceService.searchInsurancesByPayerName(query);
        if (list.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body("No insurance records found for \"" + query + "\"");
        }
        return ResponseEntity.ok(list);
    }
}
