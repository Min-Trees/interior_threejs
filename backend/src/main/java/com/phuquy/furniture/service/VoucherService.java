package com.phuquy.furniture.service;

import com.phuquy.furniture.dto.request.ApplyVoucherRequest;
import com.phuquy.furniture.dto.request.VoucherRequest;
import com.phuquy.furniture.dto.response.ApplyVoucherResponse;
import com.phuquy.furniture.dto.response.VoucherDTO;
import com.phuquy.furniture.entity.Voucher;
import com.phuquy.furniture.exception.BadRequestException;
import com.phuquy.furniture.exception.ResourceNotFoundException;
import com.phuquy.furniture.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoucherService {

    private final VoucherRepository voucherRepository;

    @Transactional(readOnly = true)
    public List<VoucherDTO> getValidVouchers() {
        return voucherRepository.findValidVouchers(LocalDateTime.now())
                .stream()
                .map(VoucherDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VoucherDTO> getAllVouchers() {
        return voucherRepository.findAll()
                .stream()
                .map(VoucherDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApplyVoucherResponse calculateDiscount(ApplyVoucherRequest request) {
        String cleanCode = request.getCode().trim().toUpperCase();
        Voucher voucher = voucherRepository.findByCodeIgnoreCase(cleanCode)
                .orElseThrow(() -> new BadRequestException("Mã voucher '" + cleanCode + "' không tồn tại"));

        if (!voucher.getIsActive()) {
            throw new BadRequestException("Mã voucher này hiện đang bị tạm khóa");
        }

        LocalDateTime now = LocalDateTime.now();
        if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate())) {
            throw new BadRequestException("Mã voucher chưa đến thời gian áp dụng");
        }
        if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
            throw new BadRequestException("Mã voucher đã hết hạn sử dụng");
        }
        if (voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new BadRequestException("Mã voucher đã hết lượt sử dụng");
        }

        BigDecimal orderAmount = request.getOrderAmount();
        if (voucher.getMinOrderValue() != null && orderAmount.compareTo(voucher.getMinOrderValue()) < 0) {
            throw new BadRequestException("Đơn hàng tối thiểu " + String.format("%,.0f", voucher.getMinOrderValue()) + "đ để áp dụng mã này");
        }

        BigDecimal discountAmount;
        if (voucher.getDiscountType() == Voucher.DiscountType.PERCENTAGE) {
            discountAmount = orderAmount.multiply(voucher.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
            if (voucher.getMaxDiscountAmount() != null && discountAmount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discountAmount = voucher.getMaxDiscountAmount();
            }
        } else {
            discountAmount = voucher.getDiscountValue();
            if (discountAmount.compareTo(orderAmount) > 0) {
                discountAmount = orderAmount;
            }
        }

        BigDecimal finalAmount = orderAmount.subtract(discountAmount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        return ApplyVoucherResponse.builder()
                .valid(true)
                .code(voucher.getCode())
                .title(voucher.getTitle())
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .message("Áp dụng mã giảm giá thành công!")
                .build();
    }

    @Transactional
    public void recordVoucherUsage(String code) {
        if (code == null || code.isBlank()) return;
        voucherRepository.findByCodeIgnoreCase(code.trim().toUpperCase())
                .ifPresent(v -> {
                    v.setUsedCount(v.getUsedCount() + 1);
                    voucherRepository.save(v);
                });
    }

    @Transactional
    public VoucherDTO createVoucher(VoucherRequest request) {
        String cleanCode = request.getCode().trim().toUpperCase();
        if (voucherRepository.existsByCodeIgnoreCase(cleanCode)) {
            throw new BadRequestException("Mã voucher '" + cleanCode + "' đã tồn tại");
        }

        Voucher voucher = Voucher.builder()
                .code(cleanCode)
                .title(request.getTitle())
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderValue(request.getMinOrderValue())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .usageLimit(request.getUsageLimit() != null ? request.getUsageLimit() : 100)
                .usedCount(0)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return VoucherDTO.fromEntity(voucherRepository.save(voucher));
    }

    @Transactional
    public VoucherDTO updateVoucher(Long id, VoucherRequest request) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy voucher ID: " + id));

        voucher.setTitle(request.getTitle());
        voucher.setDescription(request.getDescription());
        voucher.setDiscountType(request.getDiscountType());
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMinOrderValue(request.getMinOrderValue());
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        if (request.getUsageLimit() != null) voucher.setUsageLimit(request.getUsageLimit());
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());
        if (request.getIsActive() != null) voucher.setIsActive(request.getIsActive());

        return VoucherDTO.fromEntity(voucherRepository.save(voucher));
    }

    @Transactional
    public void deleteVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy voucher ID: " + id));
        voucher.setIsActive(false);
        voucherRepository.save(voucher);
    }
}
