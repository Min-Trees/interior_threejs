package com.phuquy.furniture.service;

import com.phuquy.furniture.dto.request.ProductRequest;
import com.phuquy.furniture.dto.response.PageResponse;
import com.phuquy.furniture.dto.response.ProductDTO;
import com.phuquy.furniture.entity.Category;
import com.phuquy.furniture.entity.Product;
import com.phuquy.furniture.exception.ResourceNotFoundException;
import com.phuquy.furniture.repository.CategoryRepository;
import com.phuquy.furniture.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public PageResponse<ProductDTO> getProducts(
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String material,
            String keyword,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        String trimmedKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        String trimmedMaterial = (material != null && !material.trim().isEmpty()) ? material.trim() : null;

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("isActive")));

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (minPrice != null) {
                Expression<BigDecimal> effectivePrice = cb.coalesce(root.get("discountPrice"), root.get("price"));
                predicates.add(cb.greaterThanOrEqualTo(effectivePrice, minPrice));
            }
            if (maxPrice != null) {
                Expression<BigDecimal> effectivePrice = cb.coalesce(root.get("discountPrice"), root.get("price"));
                predicates.add(cb.lessThanOrEqualTo(effectivePrice, maxPrice));
            }
            if (trimmedMaterial != null) {
                predicates.add(cb.like(cb.lower(root.get("material")), "%" + trimmedMaterial.toLowerCase() + "%"));
            }
            if (trimmedKeyword != null) {
                String pattern = "%" + trimmedKeyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern),
                        cb.like(cb.lower(root.get("material")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> productPage = productRepository.findAll(spec, pageable);

        return PageResponse.from(productPage.map(ProductDTO::fromEntity));
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrue()
                .stream()
                .map(ProductDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
        return ProductDTO.fromEntity(product);
    }

    @Transactional(readOnly = true)
    public ProductDTO getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với slug: " + slug));
        return ProductDTO.fromEntity(product);
    }

    @Transactional
    public ProductDTO createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + request.getCategoryId()));

        String slug = request.getSlug() != null && !request.getSlug().isBlank()
                ? request.getSlug()
                : CategoryService.toSlug(request.getName());

        if (productRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        Product product = Product.builder()
                .category(category)
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .price(request.getPrice())
                .discountPrice(request.getDiscountPrice())
                .stockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0)
                .material(request.getMaterial())
                .dimensions(request.getDimensions())
                .widthCm(request.getWidthCm())
                .heightCm(request.getHeightCm())
                .depthCm(request.getDepthCm())
                .model3dUrl(request.getModel3dUrl())
                .roomPlacementRole(request.getRoomPlacementRole() != null ? com.phuquy.furniture.entity.RoomPlacementRole.valueOf(request.getRoomPlacementRole()) : null)
                .color(request.getColor())
                .weight(request.getWeight())
                .thumbnail(request.getThumbnail())
                .images(request.getImages())
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return ProductDTO.fromEntity(productRepository.save(product));
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + request.getCategoryId()));

        product.setCategory(category);
        product.setName(request.getName());
        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            product.setSlug(request.getSlug());
        }
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setDiscountPrice(request.getDiscountPrice());
        product.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0);
        product.setMaterial(request.getMaterial());
        product.setDimensions(request.getDimensions());
        product.setWidthCm(request.getWidthCm());
        product.setHeightCm(request.getHeightCm());
        product.setDepthCm(request.getDepthCm());
        product.setModel3dUrl(request.getModel3dUrl());
        if (request.getRoomPlacementRole() != null) {
            try {
                product.setRoomPlacementRole(com.phuquy.furniture.entity.RoomPlacementRole.valueOf(request.getRoomPlacementRole()));
            } catch (Exception ignored) {}
        }
        product.setColor(request.getColor());
        product.setWeight(request.getWeight());
        product.setThumbnail(request.getThumbnail());
        product.setImages(request.getImages());
        if (request.getIsFeatured() != null) product.setIsFeatured(request.getIsFeatured());
        if (request.getIsActive() != null) product.setIsActive(request.getIsActive());

        return ProductDTO.fromEntity(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
        product.setIsActive(false); // Xóa mềm để không làm hỏng dữ liệu đơn hàng
        productRepository.save(product);
    }
}
