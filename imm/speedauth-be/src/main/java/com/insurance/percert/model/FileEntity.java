package com.insurance.percert.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class FileEntity {

    @Id 
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String filePath;
    private LocalDateTime uploadTime; 
    private String fileType;
    private String medicalFileType;

    // @Lob
    // @Column(length = 10485760) // Optional: max 10MB
    // private byte[] data;

    
    @Lob
    @Column(length = 52428800) // Optional: max 50MB
    private byte[] data;

 @ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "patient_id")
@JsonBackReference // Optional, helps with JSON infinite loop
private PatientEntity patient;


    // constructors, getters, setters

    public Long getId() {
    return id;
    
}

public void setId(Long id) {
    this.id = id;
}

public String getFileName() {
    return fileName;
}

public void setFileName(String fileName) {
    this.fileName = fileName;
}

public String getFilePath() {
    return filePath;
}

public void setFilePath(String filePath) {
    this.filePath = filePath;
}

public LocalDateTime getUploadTime() {
    return uploadTime;
}

public void setUploadTime(LocalDateTime uploadTime) {
    this.uploadTime = uploadTime;
}

public String getFileType() {
    return fileType;
}

public void setFileType(String fileType) {
    this.fileType = fileType;
}

  public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }

    public String getMedicalFileType() {
    return medicalFileType;
}

public void setMedicalFileType(String medicalFileType) {
    this.medicalFileType = medicalFileType;
}


public PatientEntity getPatient() {
    return patient;
}

public void setPatient(PatientEntity patient) {
    this.patient = patient;
}
}
