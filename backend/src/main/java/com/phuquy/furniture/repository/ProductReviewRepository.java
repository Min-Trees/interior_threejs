package com.phuquy.furniture.repository;

import com.phuquy.furniture.entity.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    List<ProductReview> findByProductIdAndStatusOrderByCreatedAtDesc(Long productId, ProductReview.ReviewStatus status);

    Page<ProductReview> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByProductIdAndStatus(Long productId, ProductReview.ReviewStatus status);
}
