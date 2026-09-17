package com.phuquy.furniture.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class ChatRateLimiterService {

    private static final int MAX_REQUESTS_PER_WINDOW = 20; // 20 requests
    private static final long WINDOW_SECONDS = 60; // per 60 seconds

    private static class ClientCounter {
        long windowStart;
        int count;

        ClientCounter(long now) {
            this.windowStart = now;
            this.count = 1;
        }
    }

    private final Map<String, ClientCounter> clientBuckets = new ConcurrentHashMap<>();

    public boolean tryAcquire(String clientIdentifier) {
        long now = Instant.now().getEpochSecond();
        String key = (clientIdentifier != null && !clientIdentifier.isBlank()) ? clientIdentifier : "anonymous";

        ClientCounter counter = clientBuckets.compute(key, (k, v) -> {
            if (v == null || (now - v.windowStart) > WINDOW_SECONDS) {
                return new ClientCounter(now);
            }
            v.count++;
            return v;
        });

        if (counter.count > MAX_REQUESTS_PER_WINDOW) {
            log.warn("Rate limit exceeded for client: {} (count: {})", key, counter.count);
            return false;
        }
        return true;
    }
}
