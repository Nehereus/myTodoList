FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

EXPOSE 8080

COPY ./todolist-0.0.1-SNAPSHOT.jar app.jar

# The command to run when the container starts
ENTRYPOINT ["java", "-jar", "/app/app.jar"]