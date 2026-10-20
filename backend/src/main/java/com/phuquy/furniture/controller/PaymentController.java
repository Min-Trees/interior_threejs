package com.phuquy.furniture.controller;

import com.phuquy.furniture.config.VnpayConfig;
import com.phuquy.furniture.dto.response.ApiResponse;
import com.phuquy.furniture.dto.response.PaymentResultDTO;
import com.phuquy.furniture.entity.Order;
import com.phuquy.furniture.exception.ResourceNotFoundException;
import com.phuquy.furniture.repository.OrderRepository;
import com.phuquy.furniture.service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final VnpayService vnpayService;
    private final VnpayConfig vnpayConfig;
    private final OrderRepository orderRepository;

    /**
     * Tạo liên kết thanh toán VNPAY Sandbox cho đơn hàng đã có
     */
    @GetMapping("/vnpay/create-url")
    public ResponseEntity<ApiResponse<Map<String, String>>> createVnpayUrl(
            @RequestParam String orderCode,
            HttpServletRequest request
    ) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng: " + orderCode));

        String ipAddress = vnpayConfig.getIpAddress(request);
        String paymentUrl = vnpayService.createPaymentUrl(order, ipAddress);

        Map<String, String> data = new HashMap<>();
        data.put("orderCode", orderCode);
        data.put("paymentUrl", paymentUrl);

        return ResponseEntity.ok(ApiResponse.ok("Tạo liên kết thanh toán VNPAY thành công", data));
    }

    /**
     * Endpoint xử lý phản hồi khi người dùng thanh toán xong và được VNPAY chuyển hướng về
     */
    @GetMapping("/vnpay/callback")
    public ResponseEntity<ApiResponse<PaymentResultDTO>> handleVnpayCallback(
            @RequestParam Map<String, String> queryParams
    ) {
        log.info("Nhận callback từ VNPAY: {}", queryParams);
        PaymentResultDTO result = vnpayService.processCallback(queryParams);
        return ResponseEntity.ok(ApiResponse.ok(result.getMessage(), result));
    }

    /**
     * Endpoint IPN (Instant Payment Notification) từ Server VNPAY sang Server Phú Quý
     */
    @GetMapping("/vnpay/ipn")
    public ResponseEntity<Map<String, String>> handleVnpayIpn(
            @RequestParam Map<String, String> queryParams
    ) {
        log.info("Nhận IPN từ VNPAY: {}", queryParams);
        PaymentResultDTO result = vnpayService.processCallback(queryParams);
        
        Map<String, String> response = new HashMap<>();
        if (result.isSuccess()) {
            response.put("RspCode", "00");
            response.put("Message", "Confirm Success");
        } else {
            response.put("RspCode", "99");
            response.put("Message", "Payment Failed");
        }
        return ResponseEntity.ok(response);
    }
}
