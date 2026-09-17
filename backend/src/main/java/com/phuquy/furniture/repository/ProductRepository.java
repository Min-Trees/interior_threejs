package com.phuquy.furniture.repository;

import com.phuquy.furniture.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Product> findByIsFeaturedTrueAndIsActiveTrue();

    List<Product> findByIsActiveTrue();

    @Query(value = "SELECT * FROM products p WHERE p.is_active = true AND p.embedding IS NOT NULL " +
                   "ORDER BY p.id DESC LIMIT :limit", nativeQuery = true)
    List<Product> findProductsWithEmbedding(@Param("limit") int limit);
}
