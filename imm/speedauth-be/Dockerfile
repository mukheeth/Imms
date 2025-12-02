FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

# Copy Maven wrapper and pom
COPY mvnw* pom.xml ./
COPY .mvn .mvn

# Copy source
COPY src src

# Build the application (skip tests for faster builds)
RUN ./mvnw clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Use PORT env var if provided (default 8082)
ENV PORT=8082
EXPOSE 8082

ENTRYPOINT ["java","-jar","/app/app.jar"]
