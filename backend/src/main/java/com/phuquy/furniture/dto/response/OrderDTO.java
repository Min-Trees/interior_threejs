package com.phuquy.furniture.dto.response;

import com.phuquy.furniture.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long id;
    private String orderCode;
    private Long userId;
    private String userEmail;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private String voucherCode;
    private BigDecimal shippingFee;
    private String status;
    private String paymentMethod;
    private String paymentStatus;
    private String recipientName;
    private String recipientPhone;
    private String shippingAddress;
    private String note;
    private List<OrderItemDTO> items;
    private LocalDateTime createdAt;

    public static OrderDTO fromEntity(Order order) {
        List<OrderItemDTO> itemDTOs = order.getItems() != null
                ? order.getItems().stream().map(OrderItemDTO::fromEntity).collect(Collectors.toList())
                : Collections.emptyList();

        return OrderDTO.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .userEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .voucherCode(order.getVoucherCode())
                .shippingFee(order.getShippingFee())
                .status(order.getStatus().name())
                .paymentMethod(order.getPaymentMethod().name())
                .paymentStatus(order.getPaymentStatus().name())
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .shippingAddress(order.getShippingAddress())
                .note(order.getNote())
                .items(itemDTOs)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
