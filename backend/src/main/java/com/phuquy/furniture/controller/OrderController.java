package com.phuquy.furniture.controller;

import com.phuquy.furniture.dto.request.CreateOrderRequest;
import com.phuquy.furniture.dto.request.UpdateOrderStatusRequest;
import com.phuquy.furniture.dto.response.ApiResponse;
import com.phuquy.furniture.dto.response.DashboardStatsDTO;
import com.phuquy.furniture.dto.response.OrderDTO;
import com.phuquy.furniture.dto.response.PageResponse;
import com.phuquy.furniture.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDTO>> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        OrderDTO order = orderService.createOrder(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đặt hàng thành công! Cảm ơn bạn đã lựa chọn Nội thất Phú Quý.", order));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getMyOrders(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getUserOrders(userDetails.getUsername())));
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderByCode(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String orderCode
    ) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrderByCode(orderCode, userDetails.getUsername())));
    }

    // Admin endpoints
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<OrderDTO>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getAllOrders(page, size)));
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        OrderDTO order = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái đơn hàng thành công", order));
    }

    @GetMapping("/admin/dashboard-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getDashboardStats()));
    }
}
