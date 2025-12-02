package com.insurance.percert.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.percert.model.IcdEntity;
import com.insurance.percert.service.IcdService;





@RestController
@RequestMapping("icd")
@CrossOrigin(origins = "http://localhost:3000")
public class IcdController {
    

    @Autowired
    private IcdService icdservice;


    @PostMapping("/create")
    public IcdEntity createIcd(@RequestBody IcdEntity icdEntity) {
        //TODO: process POST request

        IcdEntity createdIcd = icdservice.createIcd(icdEntity);
        return createdIcd;
    }
    

    @GetMapping("/getall")
    public List<IcdEntity> getAllIcd() {
        return icdservice.getAllIcd();
    }

    @GetMapping("/getbyid/{id}")
    public Optional<IcdEntity> getById(@PathVariable Long id) {
        return icdservice.getIcdById(id); 
    }

    @GetMapping("/getAllIcdCodes")
    public List<String> getAllIcdCodes() {
        return icdservice.getAllIcdCodes();
    }
    


    
    
 
    
   

}
