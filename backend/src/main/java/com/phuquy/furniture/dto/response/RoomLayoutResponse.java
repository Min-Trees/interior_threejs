package com.phuquy.furniture.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomLayoutResponse {
    private String conceptTitle;
    private String roomType;
    private RoomDimensionsDTO roomDimensions;
    private List<PlacedItemDTO> items;
    private BigDecimal totalPrice;
    private BigDecimal totalDiscountPrice;
    private String architecturalAdvice;
}