package com.example.ExpenseTracker;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;

public class LoginSimulation extends Simulation {

    HttpProtocolBuilder httpProtocol = http
            .baseUrl("http://localhost:8080")
            .acceptHeader("application/json")
            .contentTypeHeader("application/json")
            .userAgentHeader("Gatling/PerformanceTest");

    ScenarioBuilder scn = scenario("Login Scalability Test")
            .exec(
                    http("Login Request")
                            .post("/public/login")
                            .body(StringBody("""
                                        {
                                            "name": "bob",
                                            "password": "bobpassword"
                                        }
                                    """))
                            .check(status().is(200))
                            .check(jsonPath("$.token").exists())
                            .check(jsonPath("$.username").is("bob")));

    {
        setUp(
                scn.injectOpen(
                        // Warm up phase: 10 users over 5 seconds
                        rampUsers(10).during(5),
                        // Stress test: 100 users over 20 seconds
                        rampUsers(500).during(200)))
                .protocols(httpProtocol);
    }
}
