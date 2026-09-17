package com.phuquy.furniture.dto.request;

import com.phuquy.furniture.entity.Order;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {

    @NotNull(message = "Trạng thái đơn hàng không được để trống")
    private Order.OrderStatus status;

    private Order.PaymentStatus paymentStatus;
}
