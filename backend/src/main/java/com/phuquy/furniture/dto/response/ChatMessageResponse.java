package com.phuquy.furniture.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private String sessionId;
    private Long messageId;
    private String reply;
    private List<ChatProductCardDTO> suggestedProducts;
    private LocalDateTime createdAt;
}
