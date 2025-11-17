FROM maven:3.8-eclipse-temurin-17 AS builder

WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

EXPOSE 8080

COPY --from=builder /build/target/todolist-0.0.1-SNAPSHOT.jar app.jar

# The command to run when the container starts
ENTRYPOINT ["java", "-jar", "/app/app.jar"]