package com.phuquy.furniture.service;

import com.phuquy.furniture.dto.request.ApplyVoucherRequest;
import com.phuquy.furniture.dto.response.ApplyVoucherResponse;
import com.phuquy.furniture.entity.Voucher;
import com.phuquy.furniture.exception.BadRequestException;
import com.phuquy.furniture.repository.VoucherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VoucherServiceTest {

    @Mock
    private VoucherRepository voucherRepository;

    @InjectMocks
    private VoucherService voucherService;

    private Voucher percentVoucher;
    private Voucher fixedVoucher;

    @BeforeEach
    void setUp() {
        percentVoucher = Voucher.builder()
                .code("PHUQUY10")
                .title("Giảm 10%")
                .discountType(Voucher.DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("10.00"))
                .minOrderValue(new BigDecimal("5000000"))
                .maxDiscountAmount(new BigDecimal("1000000"))
                .usageLimit(100)
                .usedCount(10)
                .startDate(LocalDateTime.now().minusDays(2))
                .endDate(LocalDateTime.now().plusDays(10))
                .isActive(true)
                .build();

        fixedVoucher = Voucher.builder()
                .code("GIAM500K")
                .title("Giảm 500.000đ")
                .discountType(Voucher.DiscountType.FIXED_AMOUNT)
                .discountValue(new BigDecimal("500000"))
                .minOrderValue(new BigDecimal("2000000"))
                .usageLimit(50)
                .usedCount(5)
                .startDate(LocalDateTime.now().minusDays(1))
                .endDate(LocalDateTime.now().plusDays(5))
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Áp dụng voucher phần trăm thành công và bị chặn trần maxDiscount")
    void testApplyPercentageVoucherWithMaxCap() {
        when(voucherRepository.findByCodeIgnoreCase("PHUQUY10")).thenReturn(Optional.of(percentVoucher));

        ApplyVoucherRequest req = new ApplyVoucherRequest();
        req.setCode("PHUQUY10");
        req.setOrderAmount(new BigDecimal("20000000")); // 10% của 20M là 2M, nhưng maxDiscount là 1M

        ApplyVoucherResponse res = voucherService.calculateDiscount(req);

        assertTrue(res.isValid());
        assertEquals(new BigDecimal("1000000"), res.getDiscountAmount());
        assertEquals(new BigDecimal("19000000"), res.getFinalAmount());
    }

    @Test
    @DisplayName("Áp dụng voucher số tiền cố định thành công")
    void testApplyFixedAmountVoucherSuccess() {
        when(voucherRepository.findByCodeIgnoreCase("GIAM500K")).thenReturn(Optional.of(fixedVoucher));

        ApplyVoucherRequest req = new ApplyVoucherRequest();
        req.setCode("GIAM500K");
        req.setOrderAmount(new BigDecimal("4000000"));

        ApplyVoucherResponse res = voucherService.calculateDiscount(req);

        assertTrue(res.isValid());
        assertEquals(new BigDecimal("500000"), res.getDiscountAmount());
        assertEquals(new BigDecimal("3500000"), res.getFinalAmount());
    }

    @Test
    @DisplayName("Ném lỗi khi đơn hàng không đạt giá trị tối thiểu minOrderValue")
    void testThrowWhenBelowMinOrderValue() {
        when(voucherRepository.findByCodeIgnoreCase("PHUQUY10")).thenReturn(Optional.of(percentVoucher));

        ApplyVoucherRequest req = new ApplyVoucherRequest();
        req.setCode("PHUQUY10");
        req.setOrderAmount(new BigDecimal("3000000")); // Nhỏ hơn 5M

        assertThrows(BadRequestException.class, () -> voucherService.calculateDiscount(req));
    }
}
