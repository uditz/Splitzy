package com.example.ExpenseTracker.security;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import java.io.IOException;

public class TruncateSerializer extends JsonSerializer<String> {

    private static final int MAX_LENGTH = 10;

    @Override
    public void serialize(String value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        if (value != null && value.length() > MAX_LENGTH) {
            value = value.substring(0, MAX_LENGTH) + "..."; // Truncate and add ellipsis
        }
        gen.writeString(value);
    }
}
