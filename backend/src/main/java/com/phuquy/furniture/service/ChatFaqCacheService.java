package com.phuquy.furniture.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class ChatFaqCacheService {

    private final Map<String, String> faqCache = new ConcurrentHashMap<>();

    public ChatFaqCacheService() {
        // Khởi tạo các câu hỏi thường gặp đã được thẩm định
        faqCache.put("chính sách bảo hành",
                "🛡️ **Chính Sách Bảo Hành Chính Hãng Phú Quý:**\n" +
                "- Bảo hành **5 năm** cho toàn bộ khung xương gỗ sồi/gỗ óc chó và đệm mút cao cấp.\n" +
                "- Bảo hành **2 năm** cho bề mặt da bò Ý cao cấp, phụ kiện bản lề, ray trượt thông minh.\n" +
                "- **Bảo trì trọn đời:** Định kỳ kiểm tra, dưỡng da và đánh bóng gỗ miễn phí mỗi 6 tháng tại nhà!");

        faqCache.put("bảo hành bao lâu", faqCache.get("chính sách bảo hành"));

        faqCache.put("phí vận chuyển",
                "🚚 **Chính Sách Giao Hàng & Lắp Đặt:**\n" +
                "- **Miễn phí 100%** chi phí vận chuyển và lắp đặt tận nhà tại khu vực nội thành TP. Hồ Chí Minh và Hà Nội.\n" +
                "- Hỗ trợ 50% cước xe tải chuyên dụng giao hàng các tỉnh thành trên toàn quốc.\n" +
                "- Đội ngũ kỹ thuật viên bàn giao và hướng dẫn bảo dưỡng tận tình.");

        faqCache.put("phí ship", faqCache.get("phí vận chuyển"));

        faqCache.put("địa chỉ showroom",
                "🏛️ **Hệ Thống Showroom Nội Thất Phú Quý:**\n" +
                "- **Showroom Flagship:** Tòa nhà Phú Quý, 88 Xa Lộ Hà Nội, P. Thảo Điền, TP. Thủ Đức, TP. HCM.\n" +
                "- **Giờ mở cửa:** 08:30 - 21:00 tất cả các ngày trong tuần (kể cả Thứ 7, Chủ Nhật & Ngày Lễ).\n" +
                "- **Hotline tư vấn VIP:** 1900 6868 (Miễn phí cước gọi).");

        faqCache.put("đổi trả",
                "🔄 **Chính Sách Đổi Trả Linh Hoạt Trong 30 Ngày:**\n" +
                "- Khách hàng được đổi mới 1-1 trong vòng 30 ngày nếu phát hiện bất kỳ lỗi sản xuất nào.\n" +
                "- Hỗ trợ đổi kích thước, màu sắc hoặc chuyển đổi sang mẫu mã khác tương đương giá trị.");
    }

    public Optional<String> lookupFaq(String query) {
        if (query == null || query.isBlank()) return Optional.empty();
        String clean = query.trim().toLowerCase();
        for (var entry : faqCache.entrySet()) {
            if (clean.contains(entry.getKey())) {
                log.info("Hit FAQ cache for query: '{}' -> key: '{}'", query, entry.getKey());
                return Optional.of(entry.getValue());
            }
        }
        return Optional.empty();
    }
}
