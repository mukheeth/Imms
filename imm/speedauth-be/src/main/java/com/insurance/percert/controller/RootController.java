package com.insurance.percert.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class RootController {

    @GetMapping("/")
    public Map<String, Object> root() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "IMMS API is running");
        response.put("version", "1.0.0");
        response.put("endpoints", Map.of(
            "user", "/user",
            "authorizations", "/authorizations",
            "patient", "/patient",
            "orders", "/orders",
            "provider", "/provider",
            "insurance", "/insurance",
            "practice", "/practice",
            "claims", "/claims"
        ));
        return response;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "IMMS Backend");
        return response;
    }
}

