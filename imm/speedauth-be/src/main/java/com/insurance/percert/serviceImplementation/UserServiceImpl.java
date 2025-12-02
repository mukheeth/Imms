package com.insurance.percert.serviceImplementation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.insurance.percert.Repository.UserRepository;
import com.insurance.percert.model.RolesEntity;
import com.insurance.percert.model.UserEntity;
import com.insurance.percert.service.UserService;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepo;

    @Override
    public UserEntity signUpUser(String email, String password, String userName) {
        UserEntity existingUser = userRepo.findByEmail(email);
        if (existingUser != null) {
            return null;
        }
        String uniqueId = generateUniqueId();
        UserEntity newUser = new UserEntity();
        newUser.setEmail(email);
        newUser.setPassword(password);
        newUser.setUserName(userName);
        return userRepo.save(newUser);
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
    public UserEntity signInUser(String email, String password) {
        UserEntity existingUser = userRepo.findByEmail(email);
        if (existingUser != null && existingUser.getPassword().equals(password)) {
            return existingUser;
        }
        return null;
    }

    @Override
    public String initiatePasswordReset(String email) {
        UserEntity user = userRepo.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("No user found with this email");
        }

        // Generate a reset token (for simplicity, you can make it more secure using
        // UUIDs)
        String resetToken = generateUniqueId();
        user.setResetToken(resetToken);
        userRepo.save(user);

        // Ideally, you would send this token via email to the user
        return resetToken;
    }

    @Override
    public UserEntity resetPassword(String token, String newPassword) {
        UserEntity user = userRepo.findByResetToken(token);
        if (user == null) {
            throw new IllegalArgumentException("Invalid reset token");
        }

        user.setPassword(newPassword);
        user.setResetToken(null); // Invalidate the token after use
        return userRepo.save(user);
    }

    @Override
    public UserEntity updateUserRole(Long id, UserEntity userEntity) {
        UserEntity existingUserDetails = userRepo.findById(id).get();
        existingUserDetails.setAdmin_access(userEntity.getAdmin_access());
        existingUserDetails.setResume_read(userEntity.getResume_read());
        existingUserDetails.setResume_write(userEntity.getResume_write());
        existingUserDetails.setJob_desc_read(userEntity.getJob_desc_read());
        existingUserDetails.setJob_desc_write(userEntity.getJob_desc_write());
        existingUserDetails.setRole_type(userEntity.getRole_type());
        UserEntity updatedUser = userRepo.save(existingUserDetails);
        return updatedUser;
    }

    @Override
    public RolesEntity signInRole(String email, String password) {
        UserEntity existingUser = userRepo.findByEmail(email);
        if (existingUser != null && existingUser.getPassword().equals(password)) {
            RolesEntity role = existingUser.getRole_type();
            // If user has no role, return a default role or null
            // For now, return null and let controller handle it
            return role;
        }
        return null;
    }

}