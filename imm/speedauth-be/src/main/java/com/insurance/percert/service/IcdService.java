package com.insurance.percert.service;

import java.util.List;
import java.util.Optional;

import com.insurance.percert.model.IcdEntity;

public interface IcdService {


    IcdEntity createIcd(IcdEntity icdEntity);

    List<IcdEntity> getAllIcd();

    Optional<IcdEntity> getIcdById(Long id);

    List<String> getAllIcdCodes();
}
