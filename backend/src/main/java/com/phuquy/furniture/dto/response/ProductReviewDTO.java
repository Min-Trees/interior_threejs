package com.phuquy.furniture.dto.response;

import com.phuquy.furniture.entity.ProductReview;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductReviewDTO {
    private Long id;
    private Long productId;
    private String productName;
    private Long userId;
    private String userFullName;
    private String userAvatar;
    private Integer rating;
    private String comment;
    private String status;
    private String moderationReason;
    private LocalDateTime createdAt;

    public static ProductReviewDTO fromEntity(ProductReview review) {
        return ProductReviewDTO.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .userId(review.getUser().getId())
                .userFullName(review.getUser().getFullName())
                .userAvatar(review.getUser().getAvatarUrl())
                .rating(review.getRating())
                .comment(review.getComment())
                .status(review.getStatus().name())
                .moderationReason(review.getModerationReason())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
