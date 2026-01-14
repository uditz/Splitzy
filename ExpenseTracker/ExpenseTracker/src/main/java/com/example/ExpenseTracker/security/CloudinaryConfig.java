package com.example.ExpenseTracker.security;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dmnqdiee9",
                "api_key", "887328421392147",
                "api_secret", "18fih7bh86dNLmz5HDtIaDdXXyQ"
        ));
    }
}
