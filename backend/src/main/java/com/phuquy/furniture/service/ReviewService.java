package com.phuquy.furniture.service;

import com.phuquy.furniture.dto.request.CreateReviewRequest;
import com.phuquy.furniture.dto.response.PageResponse;
import com.phuquy.furniture.dto.response.ProductReviewDTO;
import com.phuquy.furniture.entity.Product;
import com.phuquy.furniture.entity.ProductReview;
import com.phuquy.furniture.entity.User;
import com.phuquy.furniture.exception.BadRequestException;
import com.phuquy.furniture.exception.ResourceNotFoundException;
import com.phuquy.furniture.repository.ProductRepository;
import com.phuquy.furniture.repository.ProductReviewRepository;
import com.phuquy.furniture.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ContentModerationService moderationService;

    @Transactional(readOnly = true)
    public List<ProductReviewDTO> getApprovedReviewsByProduct(Long productId) {
        return reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(productId, ProductReview.ReviewStatus.APPROVED)
                .stream()
                .map(ProductReviewDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductReviewDTO createReview(String email, CreateReviewRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));

        var modResult = moderationService.moderateContent(request.getComment());

        ProductReview review = ProductReview.builder()
                .product(product)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment().trim())
                .status(modResult.status())
                .moderationReason(modResult.reason())
                .build();

        ProductReview saved = reviewRepository.save(review);

        if (saved.getStatus() == ProductReview.ReviewStatus.REJECTED) {
            log.warn("Review rejected by AI moderation: {}", modResult.reason());
            throw new BadRequestException("Bình luận của bạn không được phê duyệt: " + modResult.reason());
        }

        return ProductReviewDTO.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductReviewDTO> getAllReviews(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductReview> reviewPage = reviewRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.from(reviewPage.map(ProductReviewDTO::fromEntity));
    }

    @Transactional
    public ProductReviewDTO updateReviewStatus(Long reviewId, ProductReview.ReviewStatus status) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá ID: " + reviewId));
        review.setStatus(status);
        return ProductReviewDTO.fromEntity(reviewRepository.save(review));
    }
}
