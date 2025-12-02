package com.insurance.percert.service;

import java.util.List;

import com.insurance.percert.model.RolesEntity;



public interface RolesService {

    public RolesEntity createRoles(RolesEntity rolesentity);
    public RolesEntity getRolesById(Long id);
    public List<RolesEntity> getAllRoles();
    public RolesEntity updateRoles(Long id, RolesEntity rolesentity);
    void deleteRoles(Long id);
   
     
}
