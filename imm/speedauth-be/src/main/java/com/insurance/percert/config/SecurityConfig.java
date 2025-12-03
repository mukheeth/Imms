package com.insurance.percert.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Basic security configuration that enables CORS and permits API endpoints.
 * This is important when the backend is called from a different origin
 * (e.g. React frontend hosted on Render).
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(org.springframework.security.config.annotation.web.builders.HttpSecurity http) throws Exception {
        http
                // Disable CSRF for stateless REST-style APIs
                .csrf(csrf -> csrf.disable())
                // Enable CORS using the global CorsConfiguration (see CorsConfig)
                .cors(Customizer.withDefaults())
                // For now, allow all requests; tighten as needed later
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/user/**", "/orders/**", "/authorization/**", "/claim/**",
                                "/patient/**", "/provider/**", "/practice/**", "/insurance/**", "/**")
                        .permitAll()
                );

        return http.build();
    }
}


