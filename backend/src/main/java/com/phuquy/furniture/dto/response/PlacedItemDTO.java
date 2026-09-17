package com.phuquy.furniture.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacedItemDTO {
    private Long productId;
    private String name;
    private String category;
    private String model3dUrl;
    private String roomPlacementRole;
    private Position3D position;
    private Double rotationY;
    private Dimensions3D dimensions;
    private String color;
    private String material;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private String thumbnail;
}