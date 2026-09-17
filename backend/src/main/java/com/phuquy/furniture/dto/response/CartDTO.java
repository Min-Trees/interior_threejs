package com.phuquy.furniture.dto.response;

import com.phuquy.furniture.entity.Cart;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDTO {
    private Long id;
    private List<CartItemDTO> items;
    private int totalItems;
    private BigDecimal totalPrice;

    public static CartDTO fromEntity(Cart cart) {
        List<CartItemDTO> itemDTOs = cart.getItems() != null
                ? cart.getItems().stream().map(CartItemDTO::fromEntity).collect(Collectors.toList())
                : Collections.emptyList();

        int totalCount = itemDTOs.stream().mapToInt(CartItemDTO::getQuantity).sum();
        BigDecimal totalSum = itemDTOs.stream()
                .map(CartItemDTO::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartDTO.builder()
                .id(cart.getId())
                .items(itemDTOs)
                .totalItems(totalCount)
                .totalPrice(totalSum)
                .build();
    }
}
