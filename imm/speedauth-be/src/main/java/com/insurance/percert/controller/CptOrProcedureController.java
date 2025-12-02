package com.insurance.percert.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.percert.model.CptOrProcedureEntity;
import com.insurance.percert.service.CptOrProcedureService;
import com.insurance.percert.service.IcdService;
import java.util.*;
@RestController
@RequestMapping("cpt")
// @CrossOrigin(origins="https://speedauth.com")
@CrossOrigin(origins="http://localhost:3000")
public class CptOrProcedureController {

    @Autowired
    private CptOrProcedureService cptOrProcedureService;

    @PostMapping("/create")
    public CptOrProcedureEntity createCpt(@RequestBody CptOrProcedureEntity cptEntity) {
        return cptOrProcedureService.createCpt(cptEntity);
    }

    @GetMapping("/getall")
    public List<CptOrProcedureEntity> getAllCpt() {
        return cptOrProcedureService.getAllCpt();
    }

    @GetMapping("/getbyid/{id}")
    public Optional<CptOrProcedureEntity> getById(@PathVariable Long id) {
        return cptOrProcedureService.getCptById(id);
    }

    @GetMapping("/getAllCptCodes")
    public List<String> getAllCptCodes() {
        return cptOrProcedureService.getAllCptCodes();
    }
    
}
