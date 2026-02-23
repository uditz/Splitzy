# Multi-stage build: build with Maven, run on JRE
FROM maven:3.10.1-eclipse-temurin-21 AS build
WORKDIR /workspace

# copy maven wrapper and pom first to leverage layer caching
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw || true

# copy sources and build
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
ARG JAR_FILE=target/*.jar
COPY --from=build /workspace/target/*.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JVM_OPTS -jar /app/app.jar"]
