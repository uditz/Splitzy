package com.example.ExpenseTracker;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Disabled;

@SpringBootTest
public class RedisTest {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Disabled
    @Test
    public void testRedisConnection() {
        redisTemplate.opsForValue().set("email", "uditz2004@gmail.com");
        String obj = redisTemplate.opsForValue().get("salary");
        
        int a = 1;
    }
}
