package com.insurance.percert.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.percert.model.DrugEntity;
import com.insurance.percert.service.DrugService;

import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("drug")
// @CrossOrigin(origins="https://speedauth.com")
@CrossOrigin(origins="http://localhost:3000")
public class DrugController {
    
    @Autowired
    private DrugService drugService;

    @PostMapping("/write")
    public DrugEntity createPatientData(@RequestBody DrugEntity drugEntity) {
        DrugEntity addData = drugService.createDrugData(drugEntity);
        return addData;
    }


    @GetMapping("/read")
    public ResponseEntity<List<DrugEntity>> getAllDrugDetails() {
        List<DrugEntity> getalldrugdetails = drugService.getAllDrugDetails();
        return new ResponseEntity<List<DrugEntity>>(getalldrugdetails, HttpStatus.OK);
    }

    @GetMapping("/read/{id}")
    public ResponseEntity<DrugEntity> getPatientById(@PathVariable Long id) {
        DrugEntity getdrugbyId = drugService.getDrugById(id);
        return new ResponseEntity<DrugEntity>(getdrugbyId, HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<DrugEntity> updatePatientDetails(@PathVariable Long id,
            @RequestBody DrugEntity drugEntity) {
                DrugEntity updatedrugdetails = drugService.updateDrugDetails(id, drugEntity);
        return new ResponseEntity<DrugEntity>(updatedrugdetails, HttpStatus.OK);
    }



    // @GetMapping("/getbyname")
    // public List<DrugEntity> findByName(@RequestParam String drugName) {
    //     return drugService.findByDrugName(drugName);
    // }

    @GetMapping("/getbyname")
    public List<DrugEntity> findByName(@RequestParam String drugName) {
        List<DrugEntity> drugs = drugService.findByDrugName(drugName);
        if (drugs.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Drug name '" + drugName + "' not found.");
        }
        return drugs;
    }
    

 
    // @GetMapping("/search")
    // public List<DrugEntity> searchByName(@RequestParam("term") String term) {
    //     return drugService.searchByDrugName(term);
    // }
    @GetMapping("/search")
    public List<DrugEntity> searchByName(@RequestParam("term") String term) {
        List<DrugEntity> results = drugService.searchByDrugName(term);
        if (results.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "No drugs found matching '" + term + "'."
            );
        }
        return results;
    }




    @GetMapping("/searchByDescription")
    public List<DrugEntity> searchByDescription(@RequestParam("term") String term) {
    List<DrugEntity> results = drugService.searchByDrugDescription(term);
    if (results.isEmpty()) {
        throw new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "No drugs found with description matching '" + term + "'."
        );
    }
    return results;
}



@GetMapping("/getByDescription")
public List<DrugEntity> getByExactDescription(@RequestParam String description) {
    List<DrugEntity> drugs = drugService.findByDrugDescription(description);
    if (drugs.isEmpty()) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Drug with description '" + description + "' not found.");
    }
    return drugs;
}


}
