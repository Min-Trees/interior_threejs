package com.phuquy.furniture.service;

import com.phuquy.furniture.entity.ProductReview;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ContentModerationServiceTest {

    private final ContentModerationService moderationService = new ContentModerationService();

    @Test
    @DisplayName("Chấp thuận đánh giá hợp lệ, văn minh về chất lượng nội thất")
    void testApproveValidReview() {
        String comment = "Bộ sofa da bò Ý này ngồi rất êm ái, màu nâu da bò cực kỳ sang trọng và đường kim mũi chỉ rất đều đẹp.";
        var result = moderationService.moderateContent(comment);

        assertEquals(ProductReview.ReviewStatus.APPROVED, result.status());
        assertEquals("Nội dung hợp lệ", result.reason());
    }

    @Test
    @DisplayName("Từ chối bình luận chứa ngôn từ thô tục, xúc phạm")
    void testRejectProfanityReview() {
        String comment = "Hàng như chó chết, phục vụ dở ẹc đm lừa đảo";
        var result = moderationService.moderateContent(comment);

        assertEquals(ProductReview.ReviewStatus.REJECTED, result.status());
        assertTrue(result.reason().contains("chuẩn mực cộng đồng"));
    }

    @Test
    @DisplayName("Từ chối bình luận chứa đường dẫn spam quảng cáo hoặc số điện thoại")
    void testRejectSpamReview() {
        String comment = "Mua hàng giá rẻ hơn tại https://shopre.com hoặc add zalo 0909123456 nhé";
        var result = moderationService.moderateContent(comment);

        assertEquals(ProductReview.ReviewStatus.REJECTED, result.status());
        assertTrue(result.reason().contains("quảng cáo hoặc số điện thoại"));
    }
}
