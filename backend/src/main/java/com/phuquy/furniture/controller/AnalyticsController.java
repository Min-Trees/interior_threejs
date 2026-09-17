package com.phuquy.furniture.controller;

import com.phuquy.furniture.dto.response.AnalyticsDTO;
import com.phuquy.furniture.dto.response.ApiResponse;
import com.phuquy.furniture.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AnalyticsDTO>> getComprehensiveAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy dữ liệu thống kê phân tích thành công",
                analyticsService.getComprehensiveAnalytics()
        ));
    }
}
