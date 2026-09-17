package com.phuquy.furniture.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDTO {

    private BigDecimal totalRevenue;
    private long totalOrders;
    private long totalProducts;
    private long totalUsers;
    private double conversionRate; // Tỷ lệ chuyển đổi đơn hàng
    private BigDecimal averageOrderValue; // Giá trị trung bình / đơn

    private List<DailyRevenueItem> revenueChart;
    private List<CategorySalesItem> categoryChart;
    private List<TopProductItem> topSellingProducts;
    private ChatAnalyticsItem chatAnalytics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRevenueItem {
        private String date; // "T2", "T3" hoặc "01/09"
        private BigDecimal revenue;
        private int orders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySalesItem {
        private String name;
        private long value;
        private BigDecimal totalAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProductItem {
        private Long id;
        private String name;
        private String thumbnail;
        private int salesCount;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatAnalyticsItem {
        private long totalSessions;
        private long totalMessages;
        private double satisfactionRate;
        private List<String> trendingTopics;
    }
}
