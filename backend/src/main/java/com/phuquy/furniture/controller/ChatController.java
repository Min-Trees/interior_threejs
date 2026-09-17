package com.phuquy.furniture.controller;

import com.phuquy.furniture.dto.request.ChatMessageRequest;
import com.phuquy.furniture.dto.response.ApiResponse;
import com.phuquy.furniture.dto.response.ChatMessageResponse;
import com.phuquy.furniture.dto.response.ChatSessionDTO;
import com.phuquy.furniture.service.GroqChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final GroqChatService groqChatService;
    private final com.phuquy.furniture.service.ChatRateLimiterService rateLimiterService;
    private final com.phuquy.furniture.service.ChatFaqCacheService faqCacheService;

    @PostMapping("/message")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChatMessageRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest
    ) {
        String clientIp = httpRequest.getRemoteAddr();
        String userEmail = userDetails != null ? userDetails.getUsername() : null;
        String clientId = userEmail != null ? userEmail : clientIp;

        if (!rateLimiterService.tryAcquire(clientId)) {
            throw new com.phuquy.furniture.exception.BadRequestException("Bạn đang gửi tin nhắn quá nhanh. Vui lòng đợi 30 giây để tiếp tục nhé!");
        }

        // Kiểm tra In-Memory FAQ Cache nếu không có hình ảnh
        boolean hasImage = (request.getImageBase64() != null && !request.getImageBase64().isBlank())
                || (request.getImageUrl() != null && !request.getImageUrl().isBlank());

        if (!hasImage && request.getMessage() != null) {
            var cached = faqCacheService.lookupFaq(request.getMessage());
            if (cached.isPresent()) {
                ChatMessageResponse res = ChatMessageResponse.builder()
                        .sessionId(request.getSessionId() != null ? request.getSessionId() : java.util.UUID.randomUUID().toString())
                        .reply(cached.get())
                        .suggestedProducts(java.util.Collections.emptyList())
                        .createdAt(java.time.LocalDateTime.now())
                        .build();
                return ResponseEntity.ok(ApiResponse.ok(res));
            }
        }

        ChatMessageResponse response = groqChatService.processMessage(request, userEmail);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping(value = "/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter streamMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChatMessageRequest request
    ) {
        String userEmail = userDetails != null ? userDetails.getUsername() : null;
        return groqChatService.streamMessage(request, userEmail);
    }

    @GetMapping("/history/{sessionId}")
    public ResponseEntity<ApiResponse<ChatSessionDTO>> getHistory(@PathVariable String sessionId) {
        ChatSessionDTO history = groqChatService.getSessionHistory(sessionId);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }
}
