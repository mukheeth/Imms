// package com.example.internalservice.Roles;
package com.insurance.percert.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.RestController;

import com.insurance.percert.model.RolesEntity;
import com.insurance.percert.model.UserEntity;
import com.insurance.percert.service.RolesService;

// import com.example.internalservice.UserConfig.User.UserEntity;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("roles")
@CrossOrigin(origins = "*") // Replace with your frontend URL
public class RolesController {
    @Autowired
    private RolesService rolesService;

    @PostMapping("/write")
    public ResponseEntity<RolesEntity> createRoles(@RequestBody RolesEntity rolesEntity) {
        RolesEntity createroles = rolesService.createRoles(rolesEntity);
        return new ResponseEntity<RolesEntity>(createroles, HttpStatus.CREATED);
    }

    @GetMapping("/read/all")
    public ResponseEntity<List<RolesEntity>> getAllRoles() {
        List<RolesEntity> roles = rolesService.getAllRoles();
        return new ResponseEntity<List<RolesEntity>>(roles, HttpStatus.OK);
    }

    @GetMapping("/read/{id}")
    public ResponseEntity<RolesEntity> getRolesById(@PathVariable Long id) {
        RolesEntity roles = rolesService.getRolesById(id);
        return new ResponseEntity<RolesEntity>(roles, HttpStatus.OK);
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<RolesEntity> updateRoles(@PathVariable Long id, @RequestBody RolesEntity rolesEntity) {
        RolesEntity updatedRoles = rolesService.updateRoles(id, rolesEntity);
        return new ResponseEntity<RolesEntity>(updatedRoles, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteRoles(@PathVariable Long id) {
        rolesService.deleteRoles(id);
        return new ResponseEntity<String>("Deleted Role Successfully..!!", HttpStatus.OK);
    }

    // @GetMapping("")
    // public ResponseEntity<RolesEntity> getRolesByName(@PathVariable String
    // role_name) {
    // RolesEntity rolesname = rolesService.getRolesByName(role_name);
    // return new ResponseEntity<RolesEntity>(rolesname, HttpStatus.OK);
    // }

}
