
package com.insurance.percert.serviceImplementation;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.insurance.percert.Repository.RolesRepo;
import com.insurance.percert.model.RolesEntity;
import com.insurance.percert.model.UserEntity;
import com.insurance.percert.service.RolesService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class RolesServiceImpl implements RolesService{

    @Autowired
    private RolesRepo rolesRepo;
    @Override
    public RolesEntity createRoles(RolesEntity rolesentity){
     return rolesRepo.save(rolesentity);

    }
    @Override
	public RolesEntity getRolesById(Long id) {
		  RolesEntity getrole = rolesRepo.findById(id).get();
		  return getrole;
		  
	}
    @Override
    public List<RolesEntity> getAllRoles(){
    	return rolesRepo.findAll();
    }

    public RolesEntity updateRoles(Long id, RolesEntity rolesEntity) {
    	RolesEntity existingRolesEntity = rolesRepo.findById(id).get();
    	if(existingRolesEntity!=null)
    	{
    	    existingRolesEntity.setRole_name(rolesEntity.getRole_name());
			existingRolesEntity.setRole_desc(rolesEntity.getRole_desc());
			existingRolesEntity.setResume_read(rolesEntity.getResume_read());
			existingRolesEntity.setResume_write(rolesEntity.getResume_write());
			existingRolesEntity.setJob_desc_read(rolesEntity.getJob_desc_read());
			existingRolesEntity.setJob_desc_write(rolesEntity.getJob_desc_write());
		    existingRolesEntity.setAdmin_access(rolesEntity.getAdmin_access());
			RolesEntity updatedRolesEntity = rolesRepo.save(existingRolesEntity);
    		return updatedRolesEntity;
    	}
    	else
    	{
    		return null;
    	}
    	
    }
	  
    public void deleteRoles(Long id) {
    	rolesRepo.deleteById(id);
    }

}
