package com.insurance.percert.serviceImplementation;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.insurance.percert.Repository.PracticeRepository;
import com.insurance.percert.model.Practice;
import com.insurance.percert.service.PracticeService;
@Service
public class PracticeServiceImpl implements PracticeService{
    @Autowired
    private PracticeRepository practiceRepository;

    @Override
    public Practice createPractice(Practice practice) {
        return practiceRepository.save(practice);
    }

    @Override
    public Practice getPracticeById(Long id) {
        Optional<Practice> practice = practiceRepository.findById(id);
        return practice.orElseThrow(() -> new RuntimeException("Practice not found with id " + id));
    }

    @Override
    public List<Practice> getAllPractices() {
        return practiceRepository.findAll();
    }

    @Override
    public Practice updatePractice(Long id, Practice practiceDetails) {
        Practice practice = getPracticeById(id);
        practice.setTaxId(practiceDetails.getTaxId());
        practice.setNameOfPractice(practiceDetails.getNameOfPractice());
        practice.setContactNumber(practiceDetails.getContactNumber());
        practice.setContactPerson(practiceDetails.getContactPerson());
        practice.setAddress(practiceDetails.getAddress());
        practice.setPracticeNpiNumber(practiceDetails.getPracticeNpiNumber());
        return practiceRepository.save(practice);
    }

    @Override
    public void deletePractice(Long id) {
        Practice practice = getPracticeById(id);
        practiceRepository.delete(practice);
    }

    @Override
    public Practice signUpPractice(String email, String password, String practiceName) {
        Practice existingPractice = practiceRepository.findByEmail(email);
        if (existingPractice != null) {
            return null;
        }
        String uniqueId = generateUniqueId();
        Practice newPractice = new Practice();
        newPractice.setEmail(email);
        newPractice.setPassword(password);
        newPractice.setPracticeName(practiceName);
        return practiceRepository.save(newPractice);
    }

    private String generateUniqueId() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder uniqueId = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            int index = (int) (Math.random() * characters.length());
            uniqueId.append(characters.charAt(index));
        }
        return uniqueId.toString();
    }

    @Override
    public Practice signInPractice(String email, String password) {
        Practice existingPractice = practiceRepository.findByEmail(email);
        if (existingPractice != null && existingPractice.getPassword().equals(password)) {
            return existingPractice;
        }
        return null;
    }
    
    @Override
    public String initiatePasswordReset(String email) {
        Practice practice = practiceRepository.findByEmail(email);
        if (practice == null) {
            throw new IllegalArgumentException("No user found with this email");
        }

        // Generate a reset token (for simplicity, you can make it more secure using UUIDs)
        String resetToken = generateUniqueId();
        practice.setResetToken(resetToken);
        practiceRepository.save(practice);

        // Ideally, you would send this token via email to the user
        return resetToken;
    }

    @Override
    public Practice resetPassword(String token, String newPassword) {
        Practice practice = practiceRepository.findByResetToken(token);
        if (practice == null) {
            throw new IllegalArgumentException("Invalid reset token");
        }

        practice.setPassword(newPassword);
        practice.setResetToken(null); // Invalidate the token after use
        return practiceRepository.save(practice);
    }
}
