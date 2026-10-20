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
public class PaymentResultDTO {
    private boolean success;
    private String message;
    private String orderCode;
    private String transactionNo;
    private String bankCode;
    private BigDecimal amount;
    private String payDate;
    private String responseCode;
}
