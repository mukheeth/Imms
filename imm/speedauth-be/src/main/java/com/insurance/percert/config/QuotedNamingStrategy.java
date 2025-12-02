package com.insurance.percert.config;

import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;

public class QuotedNamingStrategy extends PhysicalNamingStrategyStandardImpl {
    
    @Override
    public Identifier toPhysicalIdentifier(Identifier name, JdbcEnvironment context) {
        // Quote all identifiers to handle PostgreSQL reserved keywords
        return Identifier.quote(name);
    }
}

