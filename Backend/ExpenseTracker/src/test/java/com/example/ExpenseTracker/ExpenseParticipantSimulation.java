package com.example.ExpenseTracker;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;

public class ExpenseParticipantSimulation extends Simulation {

    HttpProtocolBuilder httpProtocol = http
        .baseUrl("http://localhost:8080")
        .acceptHeader("application/json")
        .contentTypeHeader("application/json");

    ScenarioBuilder scn = scenario("Expense Participant API Test")
        // Step 0: Set JWT manually
        .exec(session -> session.set("jwtToken",
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1ZGl0IiwiaWF0IjoxNzY4NDIyNjM0LCJleHAiOjE3Njg0MjYyMzR9.dkwpjJ7VKe6aRE1VDxrAAU5NcRPXtzr3jFSnRnOnMuJ5XJ4u0IgUtKK_Xqc6iCaDF0tRqTSk5j85PAGAUkQi2A"
        ))

        // Step 1: Call /participant/getreq
        .exec(
            http("Get Receiver Requests")
                .get("/participant/getreq")
                .header("Authorization", "Bearer #{jwtToken}")
                .check(status().is(200))
        )

        // Step 2: Call /participant/byEid/{expenseId}
        .exec(
            http("Get Participants by ExpenseId")
                .get("/participant/byEid/1")
                .header("Authorization", "Bearer #{jwtToken}")
                .check(status().is(200))
        );

    {
        setUp(
            scn.injectOpen(
                rampUsers(50).during(30)
            )
        ).protocols(httpProtocol);
    }
}
