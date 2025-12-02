 package com.insurance.percert.controller;

import com.insurance.percert.model.FileEntity;
import com.insurance.percert.Repository.FileUploadRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

import com.insurance.percert.Repository.PatientRepository;
import com.insurance.percert.model.PatientEntity;

@RestController
@RequestMapping("/file")
// @CrossOrigin(origins="https://speedauth.com")
@CrossOrigin(origins="http://localhost:3000")
// @CrossOrigin("http://localhost:3000")
public class FileUploadController {

    @Autowired
    private FileUploadRepository fileRepository;

    @Autowired
    private PatientRepository patientRepository;

  @PostMapping("/upload")
public ResponseEntity<String> uploadFile(
    @RequestParam("file") MultipartFile file,
    @RequestParam("medicalfiletype") String medicalFileType,
    @RequestParam("patientId") Long patientId) {

    try {
        // Fetch patient from database
        Optional<PatientEntity> optionalPatient = patientRepository.findById(patientId);
        if (optionalPatient.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid patient ID");
        }

        PatientEntity patient = optionalPatient.get();

        FileEntity fileEntity = new FileEntity();
        fileEntity.setFileName(file.getOriginalFilename());
        fileEntity.setFileType(file.getContentType());
        fileEntity.setData(file.getBytes());
        fileEntity.setMedicalFileType(medicalFileType);
        fileEntity.setUploadTime(LocalDateTime.now());
        fileEntity.setPatient(patient); // ✅ Link to patient

        fileRepository.save(fileEntity);

        return ResponseEntity.ok("File uploaded successfully.");
    } catch (Exception e) {
        return ResponseEntity.status(500).body("Failed to upload file: " + e.getMessage());
    }
}


  @GetMapping("/download/{id}")
public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) {
    return fileRepository.findById(id).map(file -> {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(file.getFileType()));
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename(file.getFileName()).build());

        return new ResponseEntity<>(file.getData(), headers, HttpStatus.OK);
    }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
}
}












// import java.io.File;
// import java.io.IOException;
// import java.nio.file.Files;
// import java.nio.file.Path;
// import java.nio.file.Paths;
// import java.time.LocalDateTime;
// import java.time.format.DateTimeFormatter;
// import java.util.UUID;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.multipart.MultipartFile;

// import com.insurance.percert.Repository.FileUploadRepository;
// import com.insurance.percert.model.FileEntity;

// @RestController
// @RequestMapping("/api/files")
// public class FileUploadController {

//     private static final String UPLOAD_BASE_DIR = "uploads/";

//     @Autowired
//     private FileUploadRepository fileRepository;

//     @PostMapping("/upload")
//     public ResponseEntity<String> uploadMultipleFiles(@RequestParam("files") MultipartFile[] files) {
//         StringBuilder result = new StringBuilder();

//         for (MultipartFile file : files) {
//             try {
//                 // Get current date folder (e.g., uploads/2025/05/19/)
//                 LocalDateTime now = LocalDateTime.now();
//                 String datePath = now.format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
//                 String fullUploadPath = UPLOAD_BASE_DIR + datePath + "/";
//                 File directory = new File(fullUploadPath);
//                 if (!directory.exists()) {
//                     directory.mkdirs();
//                 }

//                 // Generate unique filename using UUID
//                 String originalName = file.getOriginalFilename();
//                 String extension = originalName != null && originalName.contains(".")
//                         ? originalName.substring(originalName.lastIndexOf("."))
//                         : "";
//                 String uniqueFileName = UUID.randomUUID().toString() + extension;

//                 // Save file to disk
//                 Path filePath = Paths.get(fullUploadPath + uniqueFileName);
//                 Files.write(filePath, file.getBytes());

//                 // Save metadata to DB
//                 FileEntity uploadedFile = new FileEntity();
//                 uploadedFile.setFileName(uniqueFileName);
//                 uploadedFile.setFilePath(filePath.toString());
//                 uploadedFile.setUploadTime(now);
//                 fileRepository.save(uploadedFile);

//                 result.append("Saved: ").append(originalName)
//                       .append(" as ").append(uniqueFileName)
//                       .append(" in ").append(datePath).append("\n");

//             } catch (IOException e) {
//                 return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                         .body("Failed to upload file: " + file.getOriginalFilename());
//             }
//         }

//         return ResponseEntity.ok(result.toString());
//     }
// }
