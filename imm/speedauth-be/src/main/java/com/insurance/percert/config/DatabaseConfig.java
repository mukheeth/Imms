package com.insurance.percert.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Bean
    @Primary
    public DataSource dataSource() throws URISyntaxException {
        // If DATABASE_URL is empty or not set, use default Spring Boot properties
        if (databaseUrl == null || databaseUrl.isEmpty() || databaseUrl.startsWith("jdbc:")) {
            // Let Spring Boot auto-configure from application.properties
            return DataSourceBuilder.create().build();
        }

        // Parse Render's PostgreSQL URL format: postgresql://user:password@host:port/dbname
        URI dbUri = new URI(databaseUrl);
        
        String username = dbUri.getUserInfo().split(":")[0];
        String password = dbUri.getUserInfo().split(":")[1];
        String host = dbUri.getHost();
        int port = dbUri.getPort();
        String dbName = dbUri.getPath().replaceFirst("/", "");
        
        // Convert to JDBC format
        String jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s", host, port, dbName);
        
        // Set system property for Hibernate dialect (PostgreSQL)
        System.setProperty("spring.jpa.properties.hibernate.dialect", 
            "org.hibernate.dialect.PostgreSQLDialect");
        
        return DataSourceBuilder.create()
                .url(jdbcUrl)
                .username(username)
                .password(password)
                .driverClassName("org.postgresql.Driver")
                .build();
    }
}

