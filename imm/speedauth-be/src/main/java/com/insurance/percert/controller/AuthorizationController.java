package com.insurance.percert.controller;

import java.io.IOException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.percert.model.Authorization;
import com.insurance.percert.model.PatientEntity;
import com.insurance.percert.model.ProviderEntity;
import com.insurance.percert.model.Insurance;
import com.insurance.percert.model.Practice;
import com.insurance.percert.model.Order;
import com.insurance.percert.Repository.PatientRepository;
import com.insurance.percert.Repository.ProviderRepository;
import com.insurance.percert.Repository.InsuranceRepository;
import com.insurance.percert.Repository.PracticeRepository;
import com.insurance.percert.Repository.OrderRepository;
import com.insurance.percert.service.AuthorizationService;
import com.insurance.percert.service.EDIService;

@RestController
@RequestMapping("/authorizations")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthorizationController {

    @Autowired
    private AuthorizationService authorizationService;
    @Autowired
    private EDIService ediService;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private ProviderRepository providerRepository;
    @Autowired
    private InsuranceRepository insuranceRepository;
    @Autowired
    private PracticeRepository practiceRepository;
    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/create")
    public ResponseEntity<Authorization> createAuthorization(@RequestBody Map<String, Object> request) {
        try {
            Authorization authorization = new Authorization();
            
            // Set default values
            authorization.setApprovalStatus("yet to submit");
            authorization.setRequestType("draft");
            authorization.setInitialSaveStatus("saved");
            
            // For now, create a simple authorization without complex entity relationships
            // This can be enhanced later when the backend is restarted
            
            Authorization createdAuth = authorizationService.createAuthorization(authorization);
            return ResponseEntity.ok(createdAuth);
            
        } catch (Exception e) {
            System.err.println("Error creating authorization: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/create-full")
    public ResponseEntity<Authorization> createFullAuthorization(@RequestBody Map<String, Object> request) {
        try {
            Authorization authorization = new Authorization();
            
            // Set default values
            authorization.setApprovalStatus("yet to submit");
            authorization.setRequestType("draft");
            authorization.setInitialSaveStatus("saved");
            
            // Handle patient (optional)
            if (request.containsKey("patient") && request.get("patient") != null) {
                Map<String, Object> patientMap = (Map<String, Object>) request.get("patient");
                if (patientMap.containsKey("patientId")) {
                    Long patientId = Long.valueOf(patientMap.get("patientId").toString());
                    PatientEntity patient = patientRepository.findById(patientId)
                        .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));
                    authorization.setPatient(patient);
                }
            }
            
            // Handle provider (required)
            if (request.containsKey("provider") && request.get("provider") != null) {
                Map<String, Object> providerMap = (Map<String, Object>) request.get("provider");
                if (providerMap.containsKey("providerId")) {
                    Long providerId = Long.valueOf(providerMap.get("providerId").toString());
                    ProviderEntity provider = providerRepository.findById(providerId)
                        .orElseThrow(() -> new RuntimeException("Provider not found with id: " + providerId));
                    authorization.setProvider(provider);
                }
            }
            
            // Handle insurance (required)
            if (request.containsKey("insurance") && request.get("insurance") != null) {
                Map<String, Object> insuranceMap = (Map<String, Object>) request.get("insurance");
                if (insuranceMap.containsKey("insuranceId")) {
                    Long insuranceId = Long.valueOf(insuranceMap.get("insuranceId").toString());
                    Insurance insurance = insuranceRepository.findById(insuranceId)
                        .orElseThrow(() -> new RuntimeException("Insurance not found with id: " + insuranceId));
                    authorization.setInsurance(insurance);
                }
            }
            
            // Handle practice (optional)
            if (request.containsKey("practice") && request.get("practice") != null) {
                Map<String, Object> practiceMap = (Map<String, Object>) request.get("practice");
                if (practiceMap.containsKey("practiceId")) {
                    Long practiceId = Long.valueOf(practiceMap.get("practiceId").toString());
                    Practice practice = practiceRepository.findById(practiceId)
                        .orElseThrow(() -> new RuntimeException("Practice not found with id: " + practiceId));
                    authorization.setPractice(practice);
                }
            }
            
            // Handle order (optional)
            if (request.containsKey("order") && request.get("order") != null) {
                Map<String, Object> orderMap = (Map<String, Object>) request.get("order");
                if (orderMap.containsKey("orderId")) {
                    Long orderId = Long.valueOf(orderMap.get("orderId").toString());
                    Order order = orderRepository.findById(orderId)
                        .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
                    authorization.setOrder(order);
                }
            }
            
            Authorization createdAuth = authorizationService.createAuthorization(authorization);
            return ResponseEntity.ok(createdAuth);
            
        } catch (Exception e) {
            System.err.println("Error creating authorization: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Authorization> getAuthorizationById(@PathVariable Long id) {
        return ResponseEntity.ok(authorizationService.getAuthorizationById(id));
    }

    @GetMapping
    public ResponseEntity<List<Authorization>> getAllAuthorizations() {
        return ResponseEntity.ok(authorizationService.getAllAuthorizations());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Authorization> updateAuthorization(
            @PathVariable Long id, @RequestBody Authorization authorization) {
        return ResponseEntity.ok(authorizationService.updateAuthorization(id, authorization));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Authorization> updateAuthorizationRequestStatus(
            @PathVariable Long id, @RequestBody Authorization authorization) {
        return ResponseEntity.ok(authorizationService.updateAuthorizationRequestStatus(id, authorization));
    }

    @PatchMapping("/inprogress/{id}")
    @CrossOrigin(origins = "http://localhost:3000") // Allow frontend URL
    public ResponseEntity<Authorization> updateAuthorizationInProgress(
            @PathVariable Long id) {
        return ResponseEntity.ok(authorizationService.updateAuthorizationInProgress(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuthorization(@PathVariable Long id) {
        authorizationService.deleteAuthorization(id);
        return ResponseEntity.noContent().build();
    }

    // @PostMapping("/approveReject")
    // public ResponseEntity<?> approveOrRejectAuthorization(@RequestBody
    // Map<String, Object> request) throws IOException {
    // Long authorizationId = ((Integer)
    // request.get("authorizationId")).longValue();
    // Authorization authorization =
    // authorizationService.getAuthorizationById(authorizationId);

    // if (!"yet to submit".equals(authorization.getApprovalStatus())) {
    // return ResponseEntity.ok(new HashMap<String, Object>() {
    // {
    // put("status", "alreadyVerified");
    // put("message", "Verification process has already been completed.");
    // put("authorizationId", authorizationId);
    // }
    // });
    // }

    // // Randomize the outcome: 0 for approve, 1 for reject, 2 for hold
    // int outcome = (int) (Math.random() * 3); // Generates 0, 1, or 2
    // String status;
    // String reason;

    // List<String> approvedReasons = List.of(
    // "All necessary checks completed; authorization is approved as per policy
    // standards.",
    // "Medical review confirms the patient meets eligibility for the requested
    // procedure.",
    // "Eligibility criteria have been satisfied; authorization is granted for this
    // request.",
    // "Patient's records support the procedure; approval is granted for the
    // scheduled treatment.",
    // "Procedure aligns with policy requirements, and authorization is now
    // approved.");

    // List<String> rejectedReasons = List.of(
    // "Required documentation is missing; request cannot proceed without additional
    // information.",
    // "Patient does not meet the required eligibility standards for the requested
    // procedure.",
    // "Policy criteria for approval are unmet; the authorization request is
    // declined.",
    // "Financial or medical authorization pending; unable to approve at this
    // stage.",
    // "Incomplete submission of essential documents results in denial of this
    // request.");
    // List<String> holdReasons = List.of(
    // "Further information is needed; additional review is required to complete the
    // authorization. Please upload any relevant documents such as Laboratory
    // Reports or Patient Medical Records.",
    // "Pending clarification from clinical team; verification of details is
    // underway. Please upload any additional documents including Peer-to-Peer
    // Consultation records if available.",
    // "Request is on hold pending policy compliance verification and eligibility
    // checks. Kindly upload relevant documentation like Laboratory Reports or
    // Patient Medical Records to expedite the process.",
    // "Additional documentation required from patient or provider before final
    // approval. Upload any supporting documents such as Peer-to-Peer Consultation
    // reports.",
    // "Request under review; awaiting results of supplementary checks and
    // assessments. Please upload any further documents like Laboratory Reports or
    // Patient Medical Records to assist in the review process.");

    // // Select a random reason based on the outcome
    // switch (outcome) {
    // case 0: // Approved
    // status = "Approved";
    // reason = approvedReasons.get((int) (Math.random() * approvedReasons.size()));
    // authorization.setApprovalStatus("Approved");
    // authorization.setApprovalReason(reason);
    // break;

    // case 1: // Rejected
    // status = "Rejected";
    // reason = rejectedReasons.get((int) (Math.random() * rejectedReasons.size()));
    // authorization.setApprovalStatus("Rejected");
    // authorization.setApprovalReason(reason);
    // break;

    // default: // Hold
    // status = "Hold";
    // reason = holdReasons.get((int) (Math.random() * holdReasons.size()));
    // authorization.setApprovalStatus("Hold");
    // authorization.setApprovalReason(reason);
    // break;
    // }

    // // Set common fields for all outcomes
    // authorization.setApprovalDate(LocalDate.now());
    // authorization.setApprovalEndDate(LocalDate.now().plusMonths(1));
    // authorization.setRequestType("submitted");
    // authorizationService.saveAuthorization(authorization);

    // // String ediFilePath1 = ediService.generateEDIFile(authorization,
    // "original");
    // String ediFilePath2 = ediService.generateEDIFile(authorization,
    // authorization.getApprovalStatus().toLowerCase());

    // return ResponseEntity.ok(new HashMap<String, Object>() {
    // {
    // put("status", status);
    // put("authorizationId", authorizationId);
    // put("approvalReason", reason);
    // // put("ediFilePath1", ediFilePath1);
    // put("ediFilePath2", ediFilePath2);
    // }
    // });

    // }

//     @PostMapping("/approveReject")
//     public ResponseEntity<?> approveOrRejectAuthorization(@RequestBody Map<String, Object> request) throws IOException {
//         Long authorizationId = ((Integer) request.get("authorizationId")).longValue();
//         Authorization authorization = authorizationService.getAuthorizationById(authorizationId);

//         // if (!"yet to submit".equals(authorization.getApprovalStatus())) {
//         // return ResponseEntity.ok(new HashMap<String, Object>() {{
//         // put("status", "alreadyVerified");
//         // put("message", "Verification process has already been completed.");
//         // put("authorizationId", authorizationId);
//         // }});
//         // }

//         // Set<String> allowedStatuses = Set.of("yet to submit", "Denied");

//         // if (!allowedStatuses.contains(authorization.getApprovalStatus())) {
//         //     return ResponseEntity.ok(Map.of(
//         //             "status", "alreadyVerified",
//         //             "message", "Verification process has already been completed.",
//         //             "authorizationId", authorizationId));
//         // }

//         //working code
//         // Set<String> allowedStatuses = Set.of("yet to submit", "Denied");

//         // if (!allowedStatuses.contains(authorization.getApprovalStatus())) {
//         // return ResponseEntity.ok(Map.of(
//         // "status", "alreadyVerified",
//         // "message", "Verification process has already been completed.",
//         // "authorizationId", authorizationId));
//         // }

//         if (authorization == null) {
//             return ResponseEntity.badRequest().body(Map.of(
//                 "status", "error",
//                 "message", "Authorization record not found.",
//                 "authorizationId", authorizationId
//             ));
//         }
    
//         String approvalStatus = authorization.getApprovalStatus();
        
//         if (approvalStatus == null) {
//             return ResponseEntity.badRequest().body(Map.of(
//                 "status", "error",
//                 "message", "Approval status is missing.",
//                 "authorizationId", authorizationId
//             ));
//         }
    
//         Set<String> allowedStatuses = Set.of("yet to submit", "Denied");
    
//         if (!allowedStatuses.contains(approvalStatus)) {
//             return ResponseEntity.ok(Map.of(
//                 "status", "alreadyVerified",
//                 "message", "Verification process has already been completed.",
//                 "authorizationId", authorizationId
//             ));
//         }
    
//         // Fix incorrect string contains check
//         if ("Denied".equals(approvalStatus)) {
//                     authorization.setApprovalStatus("In Progress");
//                     authorization.setApprovalReason("Appeal process initiated; request is under reconsideration.");
//                     authorization.setRequestType("submitted");
//                     authorization.setAuthorizationStartDate(LocalDate.now());
//                     authorizationService.saveAuthorization(authorization);

//             return ResponseEntity.ok(Map.of(
//                 "authorizationId", authorizationId,
//                 "approvalReason", authorization.getApprovalReason(),
//                 "status", "In Progress"
//             ));
//         }

        
//         // Set<String> allowedStatuses = Set.of("yet to submit", "Denied");
// // String approvalStatus = authorization.getApprovalStatus();

// // if (!allowedStatuses.contains(approvalStatus)) {
// //     return ResponseEntity.ok(Map.of(
// //         "status", "alreadyVerified",
// //         "message", "Verification process has already been completed.",
// //         "authorizationId", authorizationId
// //     ));
// // }

// // // If the status is "Denied", return the same response but with "In Progress" instead of "Denied"
// // if (!"Denied".contains(approvalStatus)) {
// //     return ResponseEntity.ok(Map.of(
// //         "authorizationId", authorizationId,
// //         "approvalReason", authorization.getApprovalReason(),
// //         // "ediFilePath2", authorization.getEdiFilePath2(),
// //         "status", "In Progress"
// //     ));
// // }


//         // Randomize the outcome: 0 for Approved, 1 for Rejected, 2 for Hold, 3 for
//         // Denied, 4 for Need MR, 5 for Peer to Peer
//         int outcome = (int) (Math.random() * 6);
//         String status;
//         String reason;

//         List<String> approvedReasons = List.of(
//                 "All necessary checks completed; authorization is approved as per policy standards.",
//                 "Medical review confirms the patient meets eligibility for the requested procedure.",
//                 "Eligibility criteria have been satisfied; authorization is granted for this request.",
//                 "Patient's records support the procedure; approval is granted for the scheduled treatment.",
//                 "Procedure aligns with policy requirements, and authorization is now approved.");

//         List<String> deniedReasons = List.of(
//                 "Required documentation is missing; request cannot proceed without additional information.",
//                 "Patient does not meet the required eligibility standards for the requested procedure.",
//                 "Policy criteria for approval are unmet; the authorization request is declined.",
//                 "Financial or medical authorization pending; unable to approve at this stage.",
//                 "Incomplete submission of essential documents results in denial of this request.");

//         List<String> needMrReasons = List.of(
//                 "Further information is needed; additional review is required to complete the authorization. Please upload any relevant documents such as Laboratory Reports or Patient Medical Records.",
//                 "Pending clarification from clinical team; verification of details is underway. Please upload any additional documents including Peer-to-Peer Consultation records if available.",
//                 "Request is on hold pending policy compliance verification and eligibility checks. Kindly upload relevant documentation like Laboratory Reports or Patient Medical Records to expedite the process.",
//                 "Additional documentation required from patient or provider before final approval. Upload any supporting documents such as Peer-to-Peer Consultation reports.",
//                 "Request under review; awaiting results of supplementary checks and assessments. Please upload any further documents like Laboratory Reports or Patient Medical Records to assist in the review process.");

//         // List<String> deniedReasons = List.of(
//         // "Authorization request has been denied due to non-compliance with policy
//         // requirements.",
//         // "The requested procedure is not covered under the patient’s insurance plan.",
//         // "Based on medical necessity review, the requested treatment is not eligible
//         // for approval.",
//         // "The procedure does not align with the insurer’s coverage guidelines, leading
//         // to denial.",
//         // "Lack of sufficient supporting medical documentation has resulted in denial
//         // of the request."
//         // );

//         // List<String> needMrReasons = List.of(
//         // "Medical records are required for further review before approval can be
//         // processed.",
//         // "Patient’s clinical history must be verified; please provide updated medical
//         // records.",
//         // "A detailed report on the patient’s condition is necessary for
//         // decision-making. Upload medical records.",
//         // "Pending submission of the latest lab reports and diagnostic test results for
//         // evaluation.",
//         // "Request put on hold until full medical documentation is provided for
//         // assessment."
//         // );

//         List<String> peerToPeerReasons = List.of(
//                 "A peer-to-peer consultation is required to determine eligibility for this request.",
//                 "The case needs further discussion between the reviewing physician and the treating provider.",
//                 "Pending direct communication between healthcare professionals before a decision can be made.",
//                 "A specialist review is necessary; the treating physician must arrange a peer-to-peer consultation.",
//                 "Decision deferred until a peer-to-peer discussion is completed between medical experts.");

//         // Assign values based on outcome
//         switch (outcome) {
//             case 0: // Approved
//                 status = "Approved";
//                 reason = approvedReasons.get((int) (Math.random() * approvedReasons.size()));
//                 authorization.setApprovalStatus("Approved");
//                 break;

//             case 1: // Rejected
//                 status = "Denied";
//                 reason = deniedReasons.get((int) (Math.random() * deniedReasons.size()));
//                 authorization.setApprovalStatus("Denied");
//                 break;

//             case 2: // Hold
//                 status = "Need MR";
//                 reason = needMrReasons.get((int) (Math.random() * needMrReasons.size()));
//                 authorization.setApprovalStatus("Need MR");
//                 break;

//             // case 3: // Denied
//             // status = "Denied";
//             // reason = deniedReasons.get((int) (Math.random() * deniedReasons.size()));
//             // authorization.setApprovalStatus("Denied");
//             // break;

//             // case 4: // Need MR (Medical Records)
//             // status = "Need MR";
//             // reason = needMrReasons.get((int) (Math.random() * needMrReasons.size()));
//             // authorization.setApprovalStatus("Need MR");
//             // break;

//             default: // Peer to Peer
//                 status = "Peer to Peer";
//                 reason = peerToPeerReasons.get((int) (Math.random() * peerToPeerReasons.size()));
//                 authorization.setApprovalStatus("Peer to Peer");
//                 break;
//         }

//         // Set common fields for all outcomes
//         authorization.setApprovalReason(reason);
//         authorization.setApprovalDate(LocalDate.now());
//         authorization.setApprovalEndDate(LocalDate.now().plusMonths(1));
//         authorization.setRequestType("submitted");
//         authorizationService.saveAuthorization(authorization);

//         // Generate EDI file
//         String ediFilePath2 = ediService.generateEDIFile(authorization,
//                 authorization.getApprovalStatus().toLowerCase());

//         return ResponseEntity.ok(new HashMap<String, Object>() {
//             {
//                 put("status", status);
//                 put("authorizationId", authorizationId);
//                 put("approvalReason", reason);
//                 put("ediFilePath2", ediFilePath2);
//             }
//         });
//     }




@PostMapping("/approveReject")
public ResponseEntity<?> approveOrRejectAuthorization(@RequestBody Map<String, Object> request) throws IOException {
    Long authorizationId = ((Integer) request.get("authorizationId")).longValue();
    Authorization authorization = authorizationService.getAuthorizationById(authorizationId);

    // if (!"yet to submit".equals(authorization.getApprovalStatus())) {
    // return ResponseEntity.ok(new HashMap<String, Object>() {{
    // put("status", "alreadyVerified");
    // put("message", "Verification process has already been completed.");
    // put("authorizationId", authorizationId);
    // }});
    // }

    // Set<String> allowedStatuses = Set.of("yet to submit", "Denied");

    // if (!allowedStatuses.contains(authorization.getApprovalStatus())) {
    //     return ResponseEntity.ok(Map.of(
    //             "status", "alreadyVerified",
    //             "message", "Verification process has already been completed.",
    //             "authorizationId", authorizationId));
    // }

    //working code
    // Set<String> allowedStatuses = Set.of("yet to submit", "Denied");

    // if (!allowedStatuses.contains(authorization.getApprovalStatus())) {
    // return ResponseEntity.ok(Map.of(
    // "status", "alreadyVerified",
    // "message", "Verification process has already been completed.",
    // "authorizationId", authorizationId));
    // }

    if (authorization == null) {
        return ResponseEntity.badRequest().body(Map.of(
            "status", "error",
            "message", "Authorization record not found.",
            "authorizationId", authorizationId
        ));
    }

    String approvalStatus = authorization.getApprovalStatus();
    
    if (approvalStatus == null) {
        return ResponseEntity.badRequest().body(Map.of(
            "status", "error",
            "message", "Approval status is missing.",
            "authorizationId", authorizationId
        ));
    }

    Set<String> allowedStatuses = Set.of("yet to submit", "Denied", "Peer to Peer", "Need MR");

    if (!allowedStatuses.contains(approvalStatus)) {
        return ResponseEntity.ok(Map.of(
            "status", "alreadyVerified",
            "message", "Verification process has already been completed.",
            "authorizationId", authorizationId
        ));
    }

    // Fix incorrect string contains check
    if ("Denied".equals(approvalStatus)) {
                authorization.setApprovalStatus("In Progress");
                authorization.setApprovalReason("Appeal process initiated; request is under reconsideration.");
                authorization.setRequestType("submitted");
                authorization.setAuthorizationStartDate(LocalDate.now());
                authorizationService.saveAuthorization(authorization);

        return ResponseEntity.ok(Map.of(
            "authorizationId", authorizationId,
            "approvalReason", authorization.getApprovalReason(),
            "status", "In Progress"
        ));
    }

    if ("Peer to Peer".equals(approvalStatus) || "Need MR".equals(approvalStatus)) {
        authorization.setApprovalStatus("Approved");
        authorization.setApprovalReason("All necessary checks completed; authorization is approved as per policy standards.");
        authorization.setRequestType("submitted");
        authorization.setAuthorizationStartDate(LocalDate.now());
        authorizationService.saveAuthorization(authorization);

return ResponseEntity.ok(Map.of(
    "authorizationId", authorizationId,
    "approvalReason", authorization.getApprovalReason(),
    "status", "Approved"
));
}

    
    // Set<String> allowedStatuses = Set.of("yet to submit", "Denied");
// String approvalStatus = authorization.getApprovalStatus();

// if (!allowedStatuses.contains(approvalStatus)) {
//     return ResponseEntity.ok(Map.of(
//         "status", "alreadyVerified",
//         "message", "Verification process has already been completed.",
//         "authorizationId", authorizationId
//     ));
// }

// // If the status is "Denied", return the same response but with "In Progress" instead of "Denied"
// if (!"Denied".contains(approvalStatus)) {
//     return ResponseEntity.ok(Map.of(
//         "authorizationId", authorizationId,
//         "approvalReason", authorization.getApprovalReason(),
//         // "ediFilePath2", authorization.getEdiFilePath2(),
//         "status", "In Progress"
//     ));
// }


    // Randomize the outcome: 0 for Approved, 1 for Rejected, 2 for Hold, 3 for
    // Denied, 4 for Need MR, 5 for Peer to Peer
    int outcome = (int) (Math.random() * 6);
    String status;
    String reason;

    List<String> approvedReasons = List.of(
            "All necessary checks completed; authorization is approved as per policy standards.",
            "Medical review confirms the patient meets eligibility for the requested procedure.",
            "Eligibility criteria have been satisfied; authorization is granted for this request.",
            "Patient's records support the procedure; approval is granted for the scheduled treatment.",
            "Procedure aligns with policy requirements, and authorization is now approved.");

    List<String> deniedReasons = List.of(
            "Required documentation is missing; request cannot proceed without additional information.",
            "Patient does not meet the required eligibility standards for the requested procedure.",
            "Policy criteria for approval are unmet; the authorization request is declined.",
            "Financial or medical authorization pending; unable to approve at this stage.",
            "Incomplete submission of essential documents results in denial of this request.");

    List<String> needMrReasons = List.of(
            "Further information is needed; additional review is required to complete the authorization. Please upload any relevant documents such as Laboratory Reports or Patient Medical Records.",
            "Pending clarification from clinical team; verification of details is underway. Please upload any additional documents including Peer-to-Peer Consultation records if available.",
            "Request is on hold pending policy compliance verification and eligibility checks. Kindly upload relevant documentation like Laboratory Reports or Patient Medical Records to expedite the process.",
            "Additional documentation required from patient or provider before final approval. Upload any supporting documents such as Peer-to-Peer Consultation reports.",
            "Request under review; awaiting results of supplementary checks and assessments. Please upload any further documents like Laboratory Reports or Patient Medical Records to assist in the review process.");

    // List<String> deniedReasons = List.of(
    // "Authorization request has been denied due to non-compliance with policy
    // requirements.",
    // "The requested procedure is not covered under the patient’s insurance plan.",
    // "Based on medical necessity review, the requested treatment is not eligible
    // for approval.",
    // "The procedure does not align with the insurer’s coverage guidelines, leading
    // to denial.",
    // "Lack of sufficient supporting medical documentation has resulted in denial
    // of the request."
    // );

    // List<String> needMrReasons = List.of(
    // "Medical records are required for further review before approval can be
    // processed.",
    // "Patient’s clinical history must be verified; please provide updated medical
    // records.",
    // "A detailed report on the patient’s condition is necessary for
    // decision-making. Upload medical records.",
    // "Pending submission of the latest lab reports and diagnostic test results for
    // evaluation.",
    // "Request put on hold until full medical documentation is provided for
    // assessment."
    // );

    List<String> peerToPeerReasons = List.of(
            "A peer-to-peer consultation is required to determine eligibility for this request.",
            "The case needs further discussion between the reviewing physician and the treating provider.",
            "Pending direct communication between healthcare professionals before a decision can be made.",
            "A specialist review is necessary; the treating physician must arrange a peer-to-peer consultation.",
            "Decision deferred until a peer-to-peer discussion is completed between medical experts.");

    // Assign values based on outcome
    switch (outcome) {
        case 0: // Approved
            status = "Approved";
            reason = approvedReasons.get((int) (Math.random() * approvedReasons.size()));
            authorization.setApprovalStatus("Approved");
            break;

        case 1: // Rejected
            status = "Denied";
            reason = deniedReasons.get((int) (Math.random() * deniedReasons.size()));
            authorization.setApprovalStatus("Denied");
            break;

        case 2: // Hold
            status = "Need MR";
            reason = needMrReasons.get((int) (Math.random() * needMrReasons.size()));
            authorization.setApprovalStatus("Need MR");
            break;

        // case 3: // Denied
        // status = "Denied";
        // reason = deniedReasons.get((int) (Math.random() * deniedReasons.size()));
        // authorization.setApprovalStatus("Denied");
        // break;

        // case 4: // Need MR (Medical Records)
        // status = "Need MR";
        // reason = needMrReasons.get((int) (Math.random() * needMrReasons.size()));
        // authorization.setApprovalStatus("Need MR");
        // break;

        default: // Peer to Peer
            status = "Peer to Peer";
            reason = peerToPeerReasons.get((int) (Math.random() * peerToPeerReasons.size()));
            authorization.setApprovalStatus("Peer to Peer");
            break;
    }

    // Set common fields for all outcomes
    authorization.setApprovalReason(reason);
    authorization.setApprovalDate(LocalDate.now());
    authorization.setApprovalEndDate(LocalDate.now().plusMonths(1));
    authorization.setRequestType("submitted");
    authorizationService.saveAuthorization(authorization);

    // Generate EDI file
    String ediFilePath2 = ediService.generateEDIFile(authorization,
            authorization.getApprovalStatus().toLowerCase());

    return ResponseEntity.ok(new HashMap<String, Object>() {
        {
            put("status", status);
            put("authorizationId", authorizationId);
            put("approvalReason", reason);
            put("ediFilePath2", ediFilePath2);
        }
    });
}

    @PostMapping("/checkeligibility/{requestId}")
    public ResponseEntity<String> checkEligibility(@PathVariable Long requestId) {
        boolean isEligible = authorizationService.checkEligibility(requestId);
        String status = isEligible ? "Eligible" : "Not Eligible";
        return ResponseEntity.ok("Eligibility Status: " + status);
    }
    
    @PostMapping("/checkeligibility/all")
public ResponseEntity<String> checkEligibilityForAll(@RequestBody List<Long> requestIds) {
    authorizationService.checkEligibilityForAll(requestIds);
    return ResponseEntity.ok("Eligibility check completed for all provided IDs.");
}

    @PostMapping("/uncheckeligibility/all")
public ResponseEntity<String> uncheckEligibilityForList(@RequestBody List<Long> requestIds) {
    authorizationService.uncheckEligibilityForList(requestIds);
    return ResponseEntity.ok("Eligibility check initiated for given request IDs.");
}



    @PostMapping("/checkvalidation/{requestId}")
    public ResponseEntity<String> validateProvider(@PathVariable Long requestId) {
        boolean isValid = authorizationService.validateProvider(requestId);
        String status = isValid ? "Valid" : "Invalid";
        return ResponseEntity.ok("Provider Validation Status: " + status);
    }

    @PostMapping("/checkvalidation/all")
public ResponseEntity<String> validateProviders(@RequestBody List<Long> requestIds) {
    authorizationService.validateProviders(requestIds);
    return ResponseEntity.ok("Provider validation completed for all provided request IDs.");
}


    @PostMapping("/uncheckvalidation/all")
    public ResponseEntity<String> invalidateListOfProviders(@RequestBody List<Long> requestIds) {
        authorizationService.invalidateListOfProviders(requestIds);
        return ResponseEntity.ok("Validating all the provided ids are reset to inital state.");
    }
    

    @PostMapping("/checkcptvalidation/{requestId}")
    public ResponseEntity<String> validateCpt(@PathVariable Long requestId) {
        boolean isValid = authorizationService.validateCpt(requestId);
        String status = isValid ? "Auth Required" : "Auth Not Required";
        return ResponseEntity.ok("CPT Validation Status: " + status);
    }

    @PostMapping("/uncheckcptvalidation/all")
    public ResponseEntity<String> invalidateCptForAll(@RequestBody List<Long> requestIds) {
        authorizationService.invalidateCptForAll(requestIds);
        return ResponseEntity.ok("reset cpt validation successful");
    }
    

    // @PostMapping("/checkvalidation/{providerName}")
    // public ResponseEntity<String> validateProvider(@RequestParam String
    // providerName) {
    // boolean isValid = authorizationService.validateProvider(providerName);
    // String status = isValid ? "Valid" : "Invalid";
    // return ResponseEntity.ok("Provider Validation Status: " + status);
    // }

}
