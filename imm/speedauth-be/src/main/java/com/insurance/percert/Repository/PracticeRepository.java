package com.insurance.percert.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.percert.model.Practice;

public interface PracticeRepository extends JpaRepository<Practice, Long> {
    
    Practice findByEmail(String email);
    Practice findByResetToken(String resetToken);

}
