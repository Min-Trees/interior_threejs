package com.phuquy.furniture.dto.response;

import com.phuquy.furniture.entity.CartItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productSlug;
    private String productThumbnail;
    private String material;
    private String dimensions;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal totalPrice;
    private Integer stockQuantity;

    public static CartItemDTO fromEntity(CartItem item) {
        BigDecimal unit = item.getPrice();
        BigDecimal total = unit.multiply(BigDecimal.valueOf(item.getQuantity()));
        return CartItemDTO.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productSlug(item.getProduct().getSlug())
                .productThumbnail(item.getProduct().getThumbnail())
                .material(item.getProduct().getMaterial())
                .dimensions(item.getProduct().getDimensions())
                .unitPrice(unit)
                .quantity(item.getQuantity())
                .totalPrice(total)
                .stockQuantity(item.getProduct().getStockQuantity())
                .build();
    }
}
