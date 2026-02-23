# eTracker

> Full-stack Expense Tracker: Spring Boot backend + Expo React Native mobile app

## Overview

This repository contains an expense-tracking application with a Java Spring Boot backend and a React Native (Expo) mobile frontend.

- Backend: `Backend/ExpenseTracker` — Spring Boot (Maven), includes Docker support.
- Mobile app: `expenseTrackerMobile` — Expo-managed React Native app.

## Features

- User authentication (login/register)
- Create and manage expenses
- Expense requests and approvals
- In-app chat (STOMP/WebSocket)
- Notifications and profile management

## Repository Structure

- `Backend/ExpenseTracker` — Spring Boot backend (Maven project)
  - `pom.xml`, `mvnw`, `Dockerfile`, `docker-compose.yml`
  - `src/main/java` — Java source
  - `src/main/resources` — `application.properties`, templates, static assets
- `expenseTrackerMobile` — Expo React Native mobile client
  - `src/` — app source, `config/`, `screens/`, `services/`

## Prerequisites

- Java 17+ (or Java 21 as available)
- Maven (optional — project includes `mvnw` wrapper)
- Docker & Docker Compose (optional, for container runs)
- Node.js (16+ recommended) and `npm` or `yarn`
- Expo CLI (optional global install) — `npm install -g expo-cli`

## Backend — Local Run

From the `Backend/ExpenseTracker` directory:

```bash
# macOS / Linux
./mvnw spring-boot:run

# Windows (Powershell / CMD)
mvnw.cmd spring-boot:run
```

Build the JAR:

```bash
./mvnw package
# or on Windows
mvnw.cmd package

# Then run the jar
java -jar target/ExpenseTracker-0.0.1-SNAPSHOT.jar
```

Run tests:

```bash
./mvnw test
# or
mvnw.cmd test
```

Environment and configuration:

- Edit `src/main/resources/application.properties` to configure database, SMTP, Redis or other services.

Docker (optional):

```bash
cd Backend/ExpenseTracker
docker-compose up --build
```

## Mobile — Local Run (Expo)

The mobile app uses Expo. From `expenseTrackerMobile`:

```bash
cd expenseTrackerMobile
npm install
# start the Expo dev server
npm run start
# or
npm run android    # launch on connected Android device/emulator
npm run ios        # launch on iOS simulator (macOS only)
```

Notes:
- The mobile app expects the backend API base URL to be configured in `src/config/constants.js` — update it to point to your backend (e.g., `http://10.0.2.2:8080` for Android emulator or your machine IP).

## Docker & Deployment

- The backend includes a `Dockerfile` and `docker-compose.yml` for containerized deployments. Adjust environment variables in the compose file before use.

## Useful Files

- Backend configuration: `Backend/ExpenseTracker/src/main/resources/application.properties`
- Mobile config: `expenseTrackerMobile/src/config/constants.js`

## Contributing

- Fork the repo, create a feature branch, and open a pull request.
- Please run backend tests and linting before opening PRs.

## Troubleshooting

- If the mobile app cannot reach the backend, verify the API base URL and CORS settings on the backend.
- Check backend logs output when running via `mvnw spring-boot:run` or Docker logs when using containers.

## License

Add license information here if applicable.

---

If you'd like, I can:
- Add badges (build, tests)
- Expand setup for CI/CD or detailed environment variables
- Create a minimal README inside `expenseTrackerMobile` (or update its existing one)
