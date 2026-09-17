package com.phuquy.furniture.controller;

import com.phuquy.furniture.dto.response.ApiResponse;
import com.phuquy.furniture.service.BenchmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class BenchmarkController {

    private final BenchmarkService benchmarkService;

    @GetMapping("/benchmark")
    public ResponseEntity<ApiResponse<BenchmarkService.BenchmarkComparisonResponse>> runBenchmark(
            @RequestParam(defaultValue = "sofa da bò phòng khách hiện đại") String query,
            @RequestParam(defaultValue = "5") int topK
    ) {
        var response = benchmarkService.compareRetrievalMethods(query, topK);
        return ResponseEntity.ok(ApiResponse.success("Thực nghiệm so sánh A/B Retrieval thành công", response));
    }
}
