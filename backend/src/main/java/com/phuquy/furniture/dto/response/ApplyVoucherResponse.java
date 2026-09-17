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
public class ApplyVoucherResponse {
    private boolean valid;
    private String code;
    private String title;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String message;
}
