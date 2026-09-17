package com.phuquy.furniture.dto.response;

import com.phuquy.furniture.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatProductCardDTO {
    private Long id;
    private String name;
    private String slug;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private String material;
    private String dimensions;
    private String thumbnail;
    private Integer stockQuantity;

    public static ChatProductCardDTO fromEntity(Product p) {
        return ChatProductCardDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .price(p.getPrice())
                .discountPrice(p.getDiscountPrice())
                .material(p.getMaterial())
                .dimensions(p.getDimensions())
                .thumbnail(p.getThumbnail())
                .stockQuantity(p.getStockQuantity())
                .build();
    }
}
