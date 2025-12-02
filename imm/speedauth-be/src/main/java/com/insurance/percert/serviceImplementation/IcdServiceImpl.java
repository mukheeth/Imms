package com.insurance.percert.serviceImplementation;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.insurance.percert.Repository.IcdRepository;
import com.insurance.percert.model.IcdEntity;
import com.insurance.percert.service.IcdService;

@Service
public class IcdServiceImpl implements  IcdService {

    @Autowired
    private IcdRepository icdRepository;


@Override
public IcdEntity createIcd(IcdEntity icdEntity){
    return icdRepository.save(icdEntity);
        }

        @Override
        public List<IcdEntity> getAllIcd()
        {
            return icdRepository.findAll();
        }

        @Override
        public Optional<IcdEntity> getIcdById(Long id){
            return icdRepository.findById(id);
        }

        @Override
        public List<String> getAllIcdCodes(){
            return icdRepository.findAllIcdCodes();
        }


    
}
