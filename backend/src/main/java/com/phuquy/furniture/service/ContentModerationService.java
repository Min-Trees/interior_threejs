package com.phuquy.furniture.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phuquy.furniture.entity.ProductReview;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentModerationService {

    @Value("${app.groq.api-key:}")
    private String groqApiKey;

    @Value("${app.groq.api-url:https://api.groq.com/openai/v1/chat/completions}")
    private String groqApiUrl;

    @Value("${app.groq.model:llama-3.3-70b-versatile}")
    private String groqModel;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    // Heuristic blacklist regex phòng trường hợp offline
    private static final Pattern PROFANITY_PATTERN = Pattern.compile(
            "\\b(dm|vcl|đm|đcm|đậu má|mẹ kiếp|lừa đảo|đĩ|chó chết|cút|sex|porn)\\b",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );
    private static final Pattern SPAM_LINK_PATTERN = Pattern.compile(
            "https?://|www\\.|t\\.me/|zalo\\.me/|09[0-9]{8}|08[0-9]{8}",
            Pattern.CASE_INSENSITIVE
    );

    public record ModerationResult(ProductReview.ReviewStatus status, String reason) {}

    public ModerationResult moderateContent(String text) {
        if (text == null || text.isBlank()) {
            return new ModerationResult(ProductReview.ReviewStatus.REJECTED, "Nội dung bình luận trống");
        }

        // Bước 1: Kiểm tra nhanh heuristic rules
        if (PROFANITY_PATTERN.matcher(text).find()) {
            log.warn("Heuristic rule flagged profanity: {}", text);
            return new ModerationResult(ProductReview.ReviewStatus.REJECTED, "Chứa từ ngữ không phù hợp với chuẩn mực cộng đồng");
        }
        if (SPAM_LINK_PATTERN.matcher(text).find()) {
            log.warn("Heuristic rule flagged spam link/phone: {}", text);
            return new ModerationResult(ProductReview.ReviewStatus.REJECTED, "Chứa liên kết quảng cáo hoặc số điện thoại spam");
        }

        // Bước 2: Kiểm tra bằng Groq LLM Guardrail nếu có API Key
        if (groqApiKey != null && !groqApiKey.isBlank() && !groqApiKey.startsWith("your_")) {
            try {
                String prompt = """
                        Bạn là hệ thống AI kiểm duyệt nội dung (Content Moderation) cho website nội thất Phú Quý.
                        Nhiệm vụ: Phân tích bình luận đánh giá sản phẩm sau:
                        \"\"\"%s\"\"\"
                        
                        Tiêu chí vi phạm:
                        - Chửi thề, thô tục, xúc phạm danh dự nhân phẩm.
                        - Spam quảng cáo link, kêu gọi cờ bạc, lừa đảo.
                        - Phá hoại có chủ đích không liên quan đến trải nghiệm mua đồ nội thất.
                        
                        Trả về DUY NHẤT một JSON hợp lệ (không kèm markdown):
                        {"status": "APPROVED", "reason": "Bình luận hợp lệ"}
                        hoặc
                        {"status": "REJECTED", "reason": "Lý do vi phạm cụ thể"}
                        """.formatted(text);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(groqApiKey);

                Map<String, Object> body = Map.of(
                        "model", groqModel,
                        "messages", List.of(
                                Map.of("role", "system", "content", "Bạn là một AI kiểm duyệt nội dung nghiêm túc, khách quan."),
                                Map.of("role", "user", "content", prompt)
                        ),
                        "temperature", 0.0,
                        "response_format", Map.of("type", "json_object")
                );

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
                var response = restTemplate.postForObject(groqApiUrl, entity, String.class);

                JsonNode root = objectMapper.readTree(response);
                String content = root.path("choices").path(0).path("message").path("content").asText();

                JsonNode parsed = objectMapper.readTree(content);
                String statusStr = parsed.path("status").asText("APPROVED");
                String reason = parsed.path("reason").asText("Đã được AI kiểm duyệt");

                ProductReview.ReviewStatus status = "REJECTED".equalsIgnoreCase(statusStr)
                        ? ProductReview.ReviewStatus.REJECTED
                        : ProductReview.ReviewStatus.APPROVED;

                log.info("AI Moderation result for text [{}...]: status={}, reason={}",
                        text.substring(0, Math.min(20, text.length())), status, reason);
                return new ModerationResult(status, reason);

            } catch (Exception e) {
                log.warn("Groq moderation failed, fallback to heuristic passed: {}", e.getMessage());
            }
        }

        // Mặc định phê duyệt nếu không dính heuristic
        return new ModerationResult(ProductReview.ReviewStatus.APPROVED, "Nội dung hợp lệ");
    }
}
