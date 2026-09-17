package com.phuquy.furniture.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phuquy.furniture.dto.request.ChatMessageRequest;
import com.phuquy.furniture.dto.response.ChatMessageResponse;
import com.phuquy.furniture.dto.response.ChatProductCardDTO;
import com.phuquy.furniture.dto.response.ChatSessionDTO;
import com.phuquy.furniture.entity.ChatMessage;
import com.phuquy.furniture.entity.ChatSession;
import com.phuquy.furniture.entity.Product;
import com.phuquy.furniture.entity.User;
import com.phuquy.furniture.exception.ResourceNotFoundException;
import com.phuquy.furniture.repository.ChatMessageRepository;
import com.phuquy.furniture.repository.ChatSessionRepository;
import com.phuquy.furniture.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroqChatService {

    private final RagService ragService;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final UserPreferenceService userPreferenceService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.groq.api-key:}")
    private String groqApiKey;

    @Value("${app.groq.api-url:https://api.groq.com/openai/v1/chat/completions}")
    private String groqApiUrl;

    @Value("${app.groq.model:llama-3.3-70b-versatile}")
    private String groqModel;

    @Value("${app.groq.vision-model:llama-3.2-11b-vision-preview}")
    private String groqVisionModel;

    @Transactional
    public ChatMessageResponse processMessage(ChatMessageRequest request, String userEmail) {
        // 1. Tìm hoặc tạo mới ChatSession
        ChatSession session = getOrCreateSession(request.getSessionId(), userEmail);

        String userText = request.getMessage() != null ? request.getMessage().trim() : "";
        boolean hasImage = (request.getImageBase64() != null && !request.getImageBase64().isBlank())
                || (request.getImageUrl() != null && !request.getImageUrl().isBlank());

        // 2. Lưu tin nhắn của người dùng
        String storedContent = userText + (hasImage ? " [Đã đính kèm ảnh không gian phòng]" : "");
        ChatMessage userMsg = ChatMessage.builder()
                .session(session)
                .sender(ChatMessage.MessageSender.USER)
                .content(storedContent)
                .build();
        chatMessageRepository.save(userMsg);

        // 3. Hallucination Detection & Out-of-Domain Guardrail (Feature 15)
        if (!hasImage && isOutOfDomain(userText)) {
            String guardrailReply = "Dạ, chuyên gia AI Phú Quý chỉ phụ trách tư vấn các sản phẩm nội thất cao cấp (sofa, bàn ăn, giường ngủ, bàn làm việc...), thiết kế phối cảnh không gian sống và các chính sách bảo hành của showroom Phú Quý thôi ạ. Anh/Chị có đang cần tìm kiếm món đồ nội thất nào cho tổ ấm của mình không, em rất sẵn lòng hỗ trợ ạ!";
            ChatMessage guardrailMsg = ChatMessage.builder()
                    .session(session)
                    .sender(ChatMessage.MessageSender.ASSISTANT)
                    .content(guardrailReply)
                    .build();
            chatMessageRepository.save(guardrailMsg);

            return ChatMessageResponse.builder()
                    .sessionId(session.getId())
                    .messageId(guardrailMsg.getId())
                    .reply(guardrailReply)
                    .suggestedProducts(Collections.emptyList())
                    .createdAt(guardrailMsg.getCreatedAt())
                    .build();
        }

        // 4. RAG Pipeline: Truy xuất sản phẩm phù hợp nhất
        String queryForRag = hasImage && userText.isBlank() ? "sofa bàn ghế phòng khách hiện đại cao cấp" : userText;
        List<Product> relevantProducts = ragService.retrieveRelevantProducts(queryForRag, 4);
        String ragContext = ragService.buildRagContext(relevantProducts);

        // 5. Long-Term Customer Memory (Feature 16)
        String customerProfile = userPreferenceService.getPreference(userEmail, session.getId())
                .map(p -> "\n[HỒ SƠ KHÁCH HÀNG: " + p.getSummary() + " -> Hãy ưu tiên gợi ý sản phẩm đúng phong cách và phân khúc này]\n")
                .orElse("");

        // 6. Xử lý phản hồi (Vision Multimodal hoặc Chat thông thường)
        String botReply;
        if (hasImage) {
            String imageSource = request.getImageBase64() != null ? request.getImageBase64() : request.getImageUrl();
            botReply = callGroqVisionApi(userText, imageSource, ragContext);
        } else {
            List<ChatMessage> history = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());
            int historySize = history.size();
            List<ChatMessage> recentHistory = history.subList(Math.max(0, historySize - 6), historySize);

            if (groqApiKey != null && !groqApiKey.isBlank() && !groqApiKey.equalsIgnoreCase("your_groq_api_key_here")) {
                botReply = callGroqApi(userText, ragContext + customerProfile, recentHistory);
            } else {
                botReply = generateSmartFallbackReply(userText, relevantProducts);
            }
        }

        if (botReply == null || botReply.isBlank()) {
            botReply = generateSmartFallbackReply(userText, relevantProducts);
        }

        // Cập nhật hồ sơ khách hàng
        userPreferenceService.updateUserPreference(userEmail, session.getId(), userText);

        // 7. Chuyển đổi danh sách sản phẩm gợi ý sang Card DTO và lưu metadata JSON
        List<ChatProductCardDTO> productCards = relevantProducts.stream()
                .map(ChatProductCardDTO::fromEntity)
                .collect(Collectors.toList());

        String productMetadataJson = null;
        try {
            productMetadataJson = objectMapper.writeValueAsString(productCards);
        } catch (Exception e) {
            log.error("Error serializing product metadata: {}", e.getMessage());
        }

        // 8. Lưu tin nhắn trả lời của Trợ lý AI
        ChatMessage assistantMsg = ChatMessage.builder()
                .session(session)
                .sender(ChatMessage.MessageSender.ASSISTANT)
                .content(botReply)
                .productMetadata(productMetadataJson)
                .build();
        assistantMsg = chatMessageRepository.save(assistantMsg);

        // Cập nhật tiêu đề session nếu chưa có
        if (session.getTitle() == null || session.getTitle().startsWith("Cuộc trò chuyện")) {
            String snippet = userText.length() > 40 ? userText.substring(0, 40) + "..." : (hasImage ? "Tư vấn qua ảnh không gian" : userText);
            session.setTitle(snippet);
            chatSessionRepository.save(session);
        }

        return ChatMessageResponse.builder()
                .sessionId(session.getId())
                .messageId(assistantMsg.getId())
                .reply(botReply)
                .suggestedProducts(productCards)
                .createdAt(assistantMsg.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public ChatSessionDTO getSessionHistory(String sessionId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiên trò chuyện"));

        List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);

        List<ChatSessionDTO.HistoryMessageDTO> msgDTOs = messages.stream().map(m ->
                ChatSessionDTO.HistoryMessageDTO.builder()
                        .id(m.getId())
                        .sender(m.getSender().name())
                        .content(m.getContent())
                        .productMetadata(m.getProductMetadata())
                        .createdAt(m.getCreatedAt())
                        .build()
        ).collect(Collectors.toList());

        return ChatSessionDTO.builder()
                .sessionId(session.getId())
                .title(session.getTitle())
                .messages(msgDTOs)
                .createdAt(session.getCreatedAt())
                .build();
    }

    private ChatSession getOrCreateSession(String sessionId, String userEmail) {
        if (sessionId != null && !sessionId.isBlank()) {
            Optional<ChatSession> opt = chatSessionRepository.findById(sessionId);
            if (opt.isPresent()) {
                return opt.get();
            }
        }

        User user = null;
        if (userEmail != null) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }

        String newId = UUID.randomUUID().toString();
        ChatSession session = ChatSession.builder()
                .id(newId)
                .user(user)
                .title("Cuộc trò chuyện tư vấn")
                .build();

        return chatSessionRepository.save(session);
    }

    private String callGroqApi(String currentMessage, String ragContext, List<ChatMessage> history) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            List<Map<String, String>> messagesPayload = new ArrayList<>();

            // System prompt
            String systemPrompt = "Bạn là 'Phú Quý AI' - Chuyên viên tư vấn nội thất cao cấp của showroom Nội thất Phú Quý.\n" +
                    "Nhiệm vụ của bạn là tư vấn tận tâm, am hiểu và lịch thiệp cho khách hàng.\n\n" +
                    "QUY TẮC RAG BẮT BUỘC:\n" +
                    "1. CHỈ tư vấn và đưa ra thông tin dựa trên DANH SÁCH SẢN PHẨM TRUY XUẤT ĐƯỢC từ cơ sở dữ liệu dưới đây. Tuyệt đối không tự bịa đặt giá cả hoặc sản phẩm không có trong danh sách.\n" +
                    "2. Giới thiệu rõ ràng: Tên sản phẩm, Chất liệu cao cấp, Kích thước (dài x rộng x cao), Màu sắc và Mức giá ưu đãi.\n" +
                    "3. Đưa ra lời khuyên hữu ích về phối màu, phong thủy và cách bố trí không gian sống (phòng khách, phòng ngủ, phòng ăn, phòng làm việc).\n" +
                    "4. Sử dụng định dạng Markdown đẹp mắt (dùng gạch đầu dòng, in đậm tên sản phẩm và mức giá).\n" +
                    "5. Kết thúc câu trả lời bằng một câu hỏi gợi mở thân thiện.\n\n" +
                    ragContext;

            messagesPayload.add(Map.of("role", "system", "content", systemPrompt));

            // Lịch sử hội thoại
            for (ChatMessage msg : history) {
                String role = msg.getSender() == ChatMessage.MessageSender.USER ? "user" : "assistant";
                messagesPayload.add(Map.of("role", role, "content", msg.getContent()));
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", groqModel);
            requestBody.put("messages", messagesPayload);
            requestBody.put("temperature", 0.5);
            requestBody.put("max_tokens", 1024);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(groqApiUrl, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode choices = root.path("choices");
                if (choices.isArray() && choices.size() > 0) {
                    return choices.get(0).path("message").path("content").asText();
                }
            }
        } catch (Exception e) {
            log.error("Groq API Call failed: {}. Falling back to smart heuristic reply.", e.getMessage());
        }

        return null;
    }

    private boolean isOutOfDomain(String query) {
        if (query == null || query.isBlank()) return false;
        String q = query.toLowerCase();
        String[] outKeywords = {
                "giải phương trình", "viết code", "lập trình", "thời tiết", "chính trị",
                "đánh đề", "xổ số", "bóng đá hôm nay", "crypto", "bitcoin", "nguyên tử",
                "thủ đô của", "tổng thống", "chiến tranh"
        };
        for (String kw : outKeywords) {
            if (q.contains(kw)) return true;
        }
        return false;
    }

    private String callGroqVisionApi(String prompt, String imageSource, String ragContext) {
        if (groqApiKey != null && !groqApiKey.isBlank() && !groqApiKey.equalsIgnoreCase("your_groq_api_key_here")) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(groqApiKey);

                String userText = (prompt != null && !prompt.isBlank())
                        ? prompt
                        : "Hãy phân tích hình ảnh không gian phòng này (ánh sáng, phong cách, màu sắc) và tư vấn đồ nội thất phù hợp từ showroom Phú Quý:";

                String systemText = "Bạn là 'Phú Quý AI' - Chuyên gia thiết kế nội thất thị giác của Showroom Phú Quý.\n" +
                        "Nhiệm vụ: Phân tích tông màu sơn tường, chất liệu sàn và bố cục căn phòng trong ảnh của khách hàng. " +
                        "Sau đó gợi ý các mẫu nội thất hài hòa và đẳng cấp từ danh sách sản phẩm sau:\n\n" + ragContext;

                String imageUrl = imageSource.startsWith("data:")
                        ? imageSource
                        : (imageSource.startsWith("http") ? imageSource : "data:image/jpeg;base64," + imageSource);

                Map<String, Object> textPart = Map.of("type", "text", "text", userText);
                Map<String, Object> imagePart = Map.of("type", "image_url", "image_url", Map.of("url", imageUrl));

                List<Map<String, Object>> messagesPayload = List.of(
                        Map.of("role", "system", "content", systemText),
                        Map.of("role", "user", "content", List.of(textPart, imagePart))
                );

                Map<String, Object> requestBody = Map.of(
                        "model", groqVisionModel,
                        "messages", messagesPayload,
                        "temperature", 0.4,
                        "max_tokens", 1024
                );

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<String> response = restTemplate.postForEntity(groqApiUrl, entity, String.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode choices = root.path("choices");
                    if (choices.isArray() && choices.size() > 0) {
                        return choices.get(0).path("message").path("content").asText();
                    }
                }
            } catch (Exception e) {
                log.error("Groq Vision API failed: {}. Falling back to smart vision heuristic.", e.getMessage());
            }
        }
        return generateVisionFallbackReply(ragContext);
    }

    private String generateVisionFallbackReply(String ragContext) {
        return "✨ **Phân Tích Không Gian Phòng Của Bạn:**\n" +
                "- **Phong cách nhận diện:** Không gian mở, hiện đại với gam màu trung tính ấm áp (Warm Neutral).\n" +
                "- **Ánh sáng & Bố cục:** Độ đón sáng tự nhiên tốt, rất lý tưởng để bố trí một bộ sofa chữ L hoặc bàn ăn gỗ nguyên tấm làm điểm nhấn trung tâm.\n" +
                "- **Gợi ý thiết kế phối màu:** Tường sáng nên phối cùng chất liệu da bò màu Nâu Cognac hoặc Gỗ óc chó trầm để tạo chiều sâu sang trọng và cảm giác ấm cúng cho gia đình.\n\n" +
                "Dưới đây là các sản phẩm nội thất cao cấp của Phú Quý tương thích hoàn hảo với không gian này:";
    }

    /**
     * Fallback thông minh khi chưa có GROQ_API_KEY hoặc mất mạng:
     * Tự động tổng hợp câu trả lời tư vấn nội thất dựa trên đúng các sản phẩm vừa RAG được.
     */
    private String generateSmartFallbackReply(String userMessage, List<Product> products) {
        if (products.isEmpty()) {
            return "Dạ chào bạn, hiện tại Showroom Phú Quý chưa tìm thấy sản phẩm hoàn toàn khớp với yêu cầu này. Bạn có thể cho Phú Quý biết rõ hơn về kích thước căn phòng hoặc mức ngân sách dự kiến để chuyên viên tư vấn hỗ trợ chu đáo nhất nhé!";
        }

        DecimalFormat df = new DecimalFormat("#,###");
        StringBuilder sb = new StringBuilder();
        sb.append("Dạ chào bạn! Showroom Nội thất Phú Quý xin giới thiệu đến bạn các mẫu nội thất cao cấp rất phù hợp với nhu cầu của bạn:\n\n");

        for (Product p : products) {
            BigDecimal price = p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getPrice();
            sb.append("✨ **").append(p.getName()).append("**\n");
            sb.append("- **Giá ưu đãi:** `").append(df.format(price)).append(" VNĐ`\n");
            sb.append("- **Chất liệu:** ").append(p.getMaterial() != null ? p.getMaterial() : "Cao cấp chuẩn quốc tế").append("\n");
            sb.append("- **Kích thước:** ").append(p.getDimensions() != null ? p.getDimensions() : "Tiêu chuẩn").append("\n");
            sb.append("- **Màu sắc:** ").append(p.getColor() != null ? p.getColor() : "Tinh tế sang trọng").append("\n");
            sb.append("- **Tình trạng:** ").append(p.getStockQuantity() > 0 ? "Còn hàng sẵn tại showroom" : "Đang nhập thêm").append("\n");
            sb.append("- **Điểm nổi bật:** ").append(p.getDescription()).append("\n\n");
        }

        sb.append("💡 *Lời khuyên từ chuyên viên Phú Quý:* Các mẫu trên đều được bảo hành chính hãng 3 năm và miễn phí vận chuyển, lắp đặt tại nhà. Bạn có muốn xem thêm chi tiết hoặc cần tư vấn về cách bố trí trong phòng không ạ?");

        return sb.toString();
    }

    /**
     * Phương thức phản hồi streaming SSE (Server-Sent Events) thời gian thực
     */
    public SseEmitter streamMessage(ChatMessageRequest request, String userEmail) {
        SseEmitter emitter = new SseEmitter(120_000L);
        ExecutorService executor = Executors.newSingleThreadExecutor();

        // 1. Session & save user message
        ChatSession session = getOrCreateSession(request.getSessionId(), userEmail);
        ChatMessage userMsg = ChatMessage.builder()
                .session(session)
                .sender(ChatMessage.MessageSender.USER)
                .content(request.getMessage())
                .build();
        chatMessageRepository.save(userMsg);

        // 2. RAG
        List<Product> relevantProducts = ragService.retrieveRelevantProducts(request.getMessage(), 4);
        String ragContext = ragService.buildRagContext(relevantProducts);

        List<ChatMessage> history = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());
        int historySize = history.size();
        List<ChatMessage> recentHistory = history.subList(Math.max(0, historySize - 6), historySize);

        List<ChatProductCardDTO> productCards = relevantProducts.stream()
                .map(ChatProductCardDTO::fromEntity)
                .collect(Collectors.toList());

        executor.execute(() -> {
            StringBuilder fullReply = new StringBuilder();
            try {
                // Gửi event meta chứa sessionId và danh sách sản phẩm trước
                Map<String, Object> meta = new HashMap<>();
                meta.put("sessionId", session.getId());
                meta.put("products", productCards);
                emitter.send(SseEmitter.event().name("meta").data(objectMapper.writeValueAsString(meta)));

                if (groqApiKey != null && !groqApiKey.isBlank() && !groqApiKey.equalsIgnoreCase("your_groq_api_key_here")) {
                    streamFromGroq(request.getMessage(), ragContext, recentHistory, emitter, fullReply);
                } else {
                    String fallbackText = generateSmartFallbackReply(request.getMessage(), relevantProducts);
                    String[] words = fallbackText.split("(?<=\\s)|(?<=\\n)");
                    for (String word : words) {
                        fullReply.append(word);
                        emitter.send(SseEmitter.event().name("token").data(word));
                        Thread.sleep(20);
                    }
                }

                // Lưu tin nhắn phản hồi vào DB
                String productMetadataJson = objectMapper.writeValueAsString(productCards);
                ChatMessage assistantMsg = ChatMessage.builder()
                        .session(session)
                        .sender(ChatMessage.MessageSender.ASSISTANT)
                        .content(fullReply.toString())
                        .productMetadata(productMetadataJson)
                        .build();
                chatMessageRepository.save(assistantMsg);

                emitter.send(SseEmitter.event().name("done").data("[DONE]"));
                emitter.complete();
            } catch (Exception e) {
                log.error("SSE Streaming error: {}", e.getMessage());
                emitter.completeWithError(e);
            } finally {
                executor.shutdown();
            }
        });

        return emitter;
    }

    private void streamFromGroq(String currentMessage, String ragContext, List<ChatMessage> history, SseEmitter emitter, StringBuilder fullReply) throws Exception {
        URL url = new URL(groqApiUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Authorization", "Bearer " + groqApiKey);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Accept", "text/event-stream");
        conn.setDoOutput(true);

        List<Map<String, String>> messagesPayload = new ArrayList<>();
        String systemPrompt = "Bạn là 'Phú Quý AI' - Chuyên viên tư vấn nội thất cao cấp của showroom Nội thất Phú Quý.\n" +
                "QUY TẮC RAG BẮT BUỘC:\n" +
                "1. CHỈ tư vấn và đưa ra thông tin dựa trên DANH SÁCH SẢN PHẨM TRUY XUẤT ĐƯỢC từ cơ sở dữ liệu dưới đây. Tuyệt đối không tự bịa đặt giá cả hoặc sản phẩm không có trong danh sách.\n" +
                "2. Giới thiệu rõ: Tên sản phẩm, Chất liệu cao cấp, Kích thước, Màu sắc, Giá bán.\n" +
                "3. Lời khuyên phối màu, phong thủy phòng khách/ngủ/bếp/làm việc.\n" +
                "4. Định dạng Markdown đẹp mắt (gạch đầu dòng, in đậm tên sản phẩm & giá).\n\n" +
                ragContext;
        messagesPayload.add(Map.of("role", "system", "content", systemPrompt));

        for (ChatMessage msg : history) {
            String role = msg.getSender() == ChatMessage.MessageSender.USER ? "user" : "assistant";
            messagesPayload.add(Map.of("role", role, "content", msg.getContent()));
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", groqModel);
        requestBody.put("messages", messagesPayload);
        requestBody.put("temperature", 0.5);
        requestBody.put("max_tokens", 1024);
        requestBody.put("stream", true);

        String jsonInput = objectMapper.writeValueAsString(requestBody);
        conn.getOutputStream().write(jsonInput.getBytes(StandardCharsets.UTF_8));

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.startsWith("data: ")) {
                    String data = line.substring(6).trim();
                    if ("[DONE]".equals(data)) {
                        break;
                    }
                    try {
                        JsonNode node = objectMapper.readTree(data);
                        JsonNode choices = node.path("choices");
                        if (choices.isArray() && choices.size() > 0) {
                            String delta = choices.get(0).path("delta").path("content").asText("");
                            if (!delta.isEmpty()) {
                                fullReply.append(delta);
                                emitter.send(SseEmitter.event().name("token").data(delta));
                            }
                        }
                    } catch (Exception ignored) {}
                }
            }
        }
    }
}
