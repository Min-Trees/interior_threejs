package com.phuquy.furniture.dto.request;

import lombok.Data;

@Data
public class ChatMessageRequest {

    private String sessionId;

    private String message;

    private String imageBase64;

    private String imageUrl;
}
