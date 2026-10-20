package com.phuquy.furniture;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.io.File;
import java.nio.file.Files;
import java.util.List;
import java.util.TimeZone;

@SpringBootApplication
@EnableJpaAuditing
public class FurnitureApplication {

    public static void main(String[] args) {
        // Fix for Windows "Asia/Saigon" timezone incompatibility with PostgreSQL on Linux
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        System.setProperty("user.timezone", "Asia/Ho_Chi_Minh");

        loadDotEnv();
        SpringApplication.run(FurnitureApplication.class, args);
    }

    private static void loadDotEnv() {
        File[] candidates = new File[]{
                new File(".env"),
                new File("../.env")
        };
        for (File file : candidates) {
            if (file.exists() && file.isFile()) {
                try {
                    List<String> lines = Files.readAllLines(file.toPath());
                    for (String line : lines) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) continue;
                        int idx = line.indexOf('=');
                        if (idx > 0) {
                            String key = line.substring(0, idx).trim();
                            String value = line.substring(idx + 1).trim();
                            if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    break;
                } catch (Exception e) {
                    System.err.println("Could not load .env file: " + e.getMessage());
                }
            }
        }
    }
}
