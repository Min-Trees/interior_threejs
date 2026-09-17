package com.phuquy.furniture.dto.response;

import com.phuquy.furniture.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private CategoryDTO category;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private Integer stockQuantity;
    private String material;
    private String dimensions;
    private Double widthCm;
    private Double heightCm;
    private Double depthCm;
    private String model3dUrl;
    private String roomPlacementRole;
    private String color;
    private Double weight;
    private String thumbnail;
    private String images;
    private Boolean isFeatured;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static ProductDTO fromEntity(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .category(product.getCategory() != null ? CategoryDTO.fromEntity(product.getCategory()) : null)
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
                .discountPrice(product.getDiscountPrice())
                .stockQuantity(product.getStockQuantity())
                .material(product.getMaterial())
                .dimensions(product.getDimensions())
                .widthCm(product.getWidthCm())
                .heightCm(product.getHeightCm())
                .depthCm(product.getDepthCm())
                .model3dUrl(product.getModel3dUrl())
                .roomPlacementRole(product.getRoomPlacementRole() != null ? product.getRoomPlacementRole().name() : null)
                .color(product.getColor())
                .weight(product.getWeight())
                .thumbnail(product.getThumbnail())
                .images(product.getImages())
                .isFeatured(product.getIsFeatured())
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
