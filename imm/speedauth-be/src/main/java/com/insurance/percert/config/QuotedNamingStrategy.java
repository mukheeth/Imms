package com.insurance.percert.config;

import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.boot.model.naming.PhysicalNamingStrategy;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;

public class QuotedNamingStrategy implements PhysicalNamingStrategy {
    
    @Override
    public Identifier toPhysicalCatalogName(Identifier name, JdbcEnvironment context) {
        return name != null ? Identifier.quote(name) : null;
    }

    @Override
    public Identifier toPhysicalSchemaName(Identifier name, JdbcEnvironment context) {
        return name != null ? Identifier.quote(name) : null;
    }

    @Override
    public Identifier toPhysicalTableName(Identifier name, JdbcEnvironment context) {
        // Quote all table names to handle PostgreSQL reserved keywords like "authorization"
        return name != null ? Identifier.quote(name) : null;
    }

    @Override
    public Identifier toPhysicalSequenceName(Identifier name, JdbcEnvironment context) {
        return name != null ? Identifier.quote(name) : null;
    }

    @Override
    public Identifier toPhysicalColumnName(Identifier name, JdbcEnvironment context) {
        return name != null ? Identifier.quote(name) : null;
    }
}

