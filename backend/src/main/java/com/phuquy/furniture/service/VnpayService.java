package com.phuquy.furniture.service;

import com.phuquy.furniture.config.VnpayConfig;
import com.phuquy.furniture.dto.response.PaymentResultDTO;
import com.phuquy.furniture.entity.Order;
import com.phuquy.furniture.entity.PaymentTransaction;
import com.phuquy.furniture.repository.OrderRepository;
import com.phuquy.furniture.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VnpayService {

    private final VnpayConfig vnpayConfig;
    private final OrderRepository orderRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;

    /**
     * Tạo liên kết thanh toán VNPAY Sandbox cho đơn hàng
     */
    public String createPaymentUrl(Order order, String ipAddress) {
        long amount = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = formatter.format(cld.getTime());

        cld.add(Calendar.MINUTE, 15);
        String vnpExpireDate = formatter.format(cld.getTime());

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpayConfig.getTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", order.getOrderCode());
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang Phu Quy: " + order.getOrderCode());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnpayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr", (ipAddress != null && !ipAddress.isBlank()) ? ipAddress : "127.0.0.1");
        vnpParams.put("vnp_CreateDate", vnpCreateDate);
        vnpParams.put("vnp_ExpireDate", vnpExpireDate);

        String queryAndHash = vnpayConfig.buildQueryAndHash(vnpParams);
        String paymentUrl = vnpayConfig.getPayUrl() + "?" + queryAndHash;
        log.info("Đã tạo VNPay Sandbox Payment URL cho đơn hàng {}: {}", order.getOrderCode(), paymentUrl);
        return paymentUrl;
    }

    /**
     * Xử lý xác thực phản hồi trả về từ VNPAY (Callback)
     */
    @Transactional
    public PaymentResultDTO processCallback(Map<String, String> allParams) {
        String vnpSecureHash = allParams.get("vnp_SecureHash");
        
        // Bản sao để tính hash
        Map<String, String> fields = new HashMap<>();
        for (Map.Entry<String, String> entry : allParams.entrySet()) {
            String fieldName = entry.getKey();
            String fieldValue = entry.getValue();
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                if (!"vnp_SecureHash".equalsIgnoreCase(fieldName) && !"vnp_SecureHashType".equalsIgnoreCase(fieldName)) {
                    fields.put(fieldName, fieldValue);
                }
            }
        }

        // Sắp xếp các trường và tạo hash để đối soát
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        for (int i = 0; i < fieldNames.size(); i++) {
            String fieldName = fieldNames.get(i);
            String fieldValue = fields.get(fieldName);
            hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
            if (i < fieldNames.size() - 1) {
                hashData.append('&');
            }
        }

        String signValue = vnpayConfig.hmacSHA512(vnpayConfig.getHashSecret(), hashData.toString());
        boolean isSignatureValid = signValue.equalsIgnoreCase(vnpSecureHash);

        String orderCode = allParams.get("vnp_TxnRef");
        String responseCode = allParams.get("vnp_ResponseCode");
        String transactionNo = allParams.get("vnp_TransactionNo");
        String bankCode = allParams.get("vnp_BankCode");
        String cardType = allParams.get("vnp_CardType");
        String payDate = allParams.get("vnp_PayDate");
        String orderInfo = allParams.get("vnp_OrderInfo");
        
        BigDecimal amount = BigDecimal.ZERO;
        if (allParams.get("vnp_Amount") != null) {
            try {
                amount = new BigDecimal(allParams.get("vnp_Amount")).divide(BigDecimal.valueOf(100));
            } catch (Exception ignored) {}
        }

        if (!isSignatureValid) {
            log.error("Xác thực chữ ký VNPAY thất bại cho đơn hàng: {}", orderCode);
            return PaymentResultDTO.builder()
                    .success(false)
                    .message("Chữ ký số không hợp lệ (Dữ liệu bị chỉnh sửa)")
                    .orderCode(orderCode)
                    .responseCode(responseCode)
                    .build();
        }

        Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode);
        boolean isSuccess = "00".equals(responseCode);

        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            if (isSuccess) {
                order.setPaymentStatus(Order.PaymentStatus.PAID);
                order.setStatus(Order.OrderStatus.CONFIRMED);
                log.info("Thanh toán VNPAY thành công cho đơn hàng: {}", orderCode);
            } else {
                order.setPaymentStatus(Order.PaymentStatus.UNPAID);
                log.warn("Thanh toán VNPAY thất bại với mã lỗi {}: {}", responseCode, orderCode);
            }
            orderRepository.save(order);

            // Ghi nhật ký giao dịch
            PaymentTransaction transaction = PaymentTransaction.builder()
                    .order(order)
                    .orderCode(orderCode)
                    .transactionNo(transactionNo)
                    .bankCode(bankCode)
                    .cardType(cardType)
                    .amount(amount)
                    .paymentMethod("VNPAY")
                    .status(isSuccess ? "SUCCESS" : "FAILED")
                    .responseCode(responseCode)
                    .orderInfo(orderInfo)
                    .payDate(payDate)
                    .build();
            paymentTransactionRepository.save(transaction);
        }

        return PaymentResultDTO.builder()
                .success(isSuccess)
                .message(isSuccess ? "Thanh toán đơn hàng qua VNPAY thành công!" : getVnpayErrorMessage(responseCode))
                .orderCode(orderCode)
                .transactionNo(transactionNo)
                .bankCode(bankCode)
                .amount(amount)
                .payDate(payDate)
                .responseCode(responseCode)
                .build();
    }

    private String getVnpayErrorMessage(String code) {
        if (code == null) return "Giao dịch không thành công";
        return switch (code) {
            case "07" -> "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, gian lận).";
            case "09" -> "Giao dịch không thành công do: Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking.";
            case "10" -> "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.";
            case "11" -> "Giao dịch không thành công do: Đã hết hạn chờ thanh toán.";
            case "12" -> "Giao dịch không thành công do: Thẻ/Tài khoản bị khóa.";
            case "13" -> "Giao dịch không thành công do: Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).";
            case "24" -> "Giao dịch không thành công do: Khách hàng hủy giao dịch.";
            case "51" -> "Giao dịch không thành công do: Tài khoản không đủ số dư.";
            case "65" -> "Giao dịch không thành công do: Tài khoản đã vượt quá hạn mức giao dịch trong ngày.";
            case "75" -> "Ngân hàng thanh toán đang bảo trì.";
            case "79" -> "Giao dịch không thành công do: Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định.";
            default -> "Giao dịch qua VNPAY không thành công (Mã lỗi: " + code + ").";
        };
    }
}
