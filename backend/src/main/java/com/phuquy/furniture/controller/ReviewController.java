package com.phuquy.furniture.controller;

import com.phuquy.furniture.dto.request.CreateReviewRequest;
import com.phuquy.furniture.dto.response.ApiResponse;
import com.phuquy.furniture.dto.response.PageResponse;
import com.phuquy.furniture.dto.response.ProductReviewDTO;
import com.phuquy.furniture.entity.ProductReview;
import com.phuquy.furniture.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/reviews/product/{productId}")
    public ResponseEntity<ApiResponse<List<ProductReviewDTO>>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đánh giá thành công",
                reviewService.getApprovedReviewsByProduct(productId)));
    }

    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse<ProductReviewDTO>> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        ProductReviewDTO dto = reviewService.createReview(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đánh giá của bạn đã được kiểm duyệt và đăng thành công", dto));
    }

    @GetMapping("/admin/reviews")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<ProductReviewDTO>>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lấy toàn bộ đánh giá thành công",
                reviewService.getAllReviews(page, size)));
    }

    @PatchMapping("/admin/reviews/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductReviewDTO>> updateReviewStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        ProductReview.ReviewStatus status = ProductReview.ReviewStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái đánh giá thành công",
                reviewService.updateReviewStatus(id, status)));
    }
}
