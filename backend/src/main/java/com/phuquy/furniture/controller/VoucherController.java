package com.phuquy.furniture.controller;

import com.phuquy.furniture.dto.request.ApplyVoucherRequest;
import com.phuquy.furniture.dto.request.VoucherRequest;
import com.phuquy.furniture.dto.response.ApiResponse;
import com.phuquy.furniture.dto.response.ApplyVoucherResponse;
import com.phuquy.furniture.dto.response.VoucherDTO;
import com.phuquy.furniture.service.VoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping("/vouchers")
    public ResponseEntity<ApiResponse<List<VoucherDTO>>> getPublicVouchers() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách mã giảm giá thành công", voucherService.getValidVouchers()));
    }

    @PostMapping("/vouchers/apply")
    public ResponseEntity<ApiResponse<ApplyVoucherResponse>> applyVoucher(@Valid @RequestBody ApplyVoucherRequest request) {
        ApplyVoucherResponse response = voucherService.calculateDiscount(request);
        return ResponseEntity.ok(ApiResponse.success("Áp dụng mã giảm giá thành công", response));
    }

    @GetMapping("/admin/vouchers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<VoucherDTO>>> getAllVouchers() {
        return ResponseEntity.ok(ApiResponse.success("Lấy toàn bộ danh sách voucher thành công", voucherService.getAllVouchers()));
    }

    @PostMapping("/admin/vouchers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VoucherDTO>> createVoucher(@Valid @RequestBody VoucherRequest request) {
        VoucherDTO dto = voucherService.createVoucher(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo mã voucher thành công", dto));
    }

    @PutMapping("/admin/vouchers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VoucherDTO>> updateVoucher(
            @PathVariable Long id,
            @Valid @RequestBody VoucherRequest request
    ) {
        VoucherDTO dto = voucherService.updateVoucher(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật mã voucher thành công", dto));
    }

    @DeleteMapping("/admin/vouchers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa mã voucher thành công", null));
    }
}
