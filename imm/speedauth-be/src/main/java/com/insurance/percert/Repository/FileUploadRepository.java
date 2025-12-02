package com.insurance.percert.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.insurance.percert.model.FileEntity;


public interface FileUploadRepository extends JpaRepository<FileEntity, Long> {
}