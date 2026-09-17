package com.phuquy.furniture.service;

import com.phuquy.furniture.entity.Product;
import com.phuquy.furniture.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagService {

    private final ProductRepository productRepository;

    private static final Set<String> STOP_WORDS = Set.of(
            "la", "va", "cua", "cho", "cac", "nhung", "mot", "co", "khong", "duoc",
            "toi", "ban", "em", "anh", "chi", "minh", "muon", "can", "tim", "tu", "van",
            "xem", "hoi", "shop", "ad", "oi", "voi", "o", "trong", "tai", "nao", "gi", "sao"
    );

    /**
     * Truy xuất các sản phẩm nội thất phù hợp nhất với câu hỏi người dùng
     */
    @Transactional(readOnly = true)
    public List<Product> retrieveRelevantProducts(String query, int topK) {
        List<Product> allProducts = productRepository.findByIsActiveTrue();
        if (allProducts.isEmpty()) {
            return Collections.emptyList();
        }

        String normalizedQuery = removeAccents(query.toLowerCase());
        Set<String> queryTokens = tokenize(normalizedQuery);
        Double targetBudget = extractBudget(normalizedQuery);

        Map<Product, Double> productScores = new HashMap<>();

        for (Product product : allProducts) {
            double score = 0.0;

            String nameNorm = removeAccents(product.getName().toLowerCase());
            String catNorm = product.getCategory() != null ? removeAccents(product.getCategory().getName().toLowerCase()) : "";
            String matNorm = product.getMaterial() != null ? removeAccents(product.getMaterial().toLowerCase()) : "";
            String descNorm = product.getDescription() != null ? removeAccents(product.getDescription().toLowerCase()) : "";
            String dimNorm = product.getDimensions() != null ? removeAccents(product.getDimensions().toLowerCase()) : "";
            String colorNorm = product.getColor() != null ? removeAccents(product.getColor().toLowerCase()) : "";

            // 1. Khớp từ khóa trong các trường thông tin
            for (String token : queryTokens) {
                if (token.length() < 2 || STOP_WORDS.contains(token)) continue;

                if (nameNorm.contains(token)) score += 3.5;
                if (catNorm.contains(token)) score += 2.5;
                if (matNorm.contains(token)) score += 3.0;
                if (colorNorm.contains(token)) score += 2.0;
                if (dimNorm.contains(token)) score += 1.5;
                if (descNorm.contains(token)) score += 1.0;
            }

            // 2. Điểm ưu tiên nếu phù hợp ngân sách mà người dùng nhắc tới
            if (targetBudget != null) {
                BigDecimal effectivePrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
                double priceVal = effectivePrice.doubleValue();

                if (normalizedQuery.contains("duoi") || normalizedQuery.contains("<") || normalizedQuery.contains("nho hon")) {
                    if (priceVal <= targetBudget) score += 4.0;
                    else score -= 3.0;
                } else if (normalizedQuery.contains("tren") || normalizedQuery.contains(">") || normalizedQuery.contains("lon hon")) {
                    if (priceVal >= targetBudget) score += 4.0;
                } else if (normalizedQuery.contains("tam") || normalizedQuery.contains("khoang")) {
                    double diff = Math.abs(priceVal - targetBudget);
                    if (diff <= targetBudget * 0.25) score += 4.0;
                    else if (diff <= targetBudget * 0.5) score += 2.0;
                }
            }

            // 3. Ưu tiên sản phẩm nổi bật nhẹ
            if (Boolean.TRUE.equals(product.getIsFeatured())) {
                score += 0.5;
            }

            if (score > 0) {
                productScores.put(product, score);
            }
        }

        // Nếu không có sản phẩm nào khớp từ khóa cụ thể, lấy các sản phẩm nổi bật mặc định
        if (productScores.isEmpty()) {
            return allProducts.stream()
                    .sorted((p1, p2) -> Boolean.compare(Boolean.TRUE.equals(p2.getIsFeatured()), Boolean.TRUE.equals(p1.getIsFeatured())))
                    .limit(topK)
                    .collect(Collectors.toList());
        }

        return productScores.entrySet().stream()
                .sorted(Map.Entry.<Product, Double>comparingByValue().reversed())
                .limit(topK)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * Tạo khối văn bản Ngữ Cảnh Sản Phẩm (Context Block) để ghép vào Prompt cho Groq LLM
     */
    public String buildRagContext(List<Product> products) {
        if (products == null || products.isEmpty()) {
            return "Hiện tại hệ thống không tìm thấy sản phẩm cụ thể nào khớp với yêu cầu.";
        }

        DecimalFormat df = new DecimalFormat("#,###");
        StringBuilder sb = new StringBuilder();
        sb.append("DANH SÁCH SẢN PHẨM NỘI THẤT THỰC TẾ CỦA SHOWROOM PHÚ QUÝ:\n\n");

        int index = 1;
        for (Product p : products) {
            BigDecimal price = p.getPrice();
            BigDecimal discountPrice = p.getDiscountPrice();
            String priceStr = df.format(price) + " VNĐ";
            if (discountPrice != null && discountPrice.compareTo(BigDecimal.ZERO) > 0) {
                priceStr = df.format(discountPrice) + " VNĐ (Giá gốc niêm yết: " + df.format(price) + " VNĐ)";
            }

            sb.append(String.format("--- Sản phẩm %d ---\n", index++));
            sb.append("Mã ID: ").append(p.getId()).append("\n");
            sb.append("Tên sản phẩm: ").append(p.getName()).append("\n");
            sb.append("Danh mục: ").append(p.getCategory() != null ? p.getCategory().getName() : "Khác").append("\n");
            sb.append("Giá bán: ").append(priceStr).append("\n");
            sb.append("Chất liệu: ").append(p.getMaterial() != null ? p.getMaterial() : "Cao cấp").append("\n");
            sb.append("Kích thước: ").append(p.getDimensions() != null ? p.getDimensions() : "Tiêu chuẩn").append("\n");
            sb.append("Màu sắc: ").append(p.getColor() != null ? p.getColor() : "Tự nhiên").append("\n");
            sb.append("Tình trạng tồn kho: ").append(p.getStockQuantity() > 0 ? "Còn hàng (" + p.getStockQuantity() + " chiếc)" : "Tạm hết hàng").append("\n");
            sb.append("Mô tả chi tiết: ").append(p.getDescription()).append("\n\n");
        }

        return sb.toString();
    }

    private Set<String> tokenize(String text) {
        return Arrays.stream(text.split("[\\s,\\.!\\?\\(\\)\\[\\]\\\"\\':;\\/\\-]+"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }

    private Double extractBudget(String query) {
        // Nhận diện số tiền dạng "15 trieu", "15tr", "15.000.000", "15 củ"
        Pattern pTrieu = Pattern.compile("(\\d+(\\.\\d+)?)\\s*(trieu|tr|cu|m)\\b");
        Matcher mTrieu = pTrieu.matcher(query);
        if (mTrieu.find()) {
            try {
                double val = Double.parseDouble(mTrieu.group(1));
                return val * 1_000_000.0;
            } catch (Exception ignored) {}
        }

        Pattern pVnd = Pattern.compile("(\\d{1,3}(?:\\.\\d{3})+)\\s*(vnd|d|dong)?");
        Matcher mVnd = pVnd.matcher(query);
        if (mVnd.find()) {
            try {
                String raw = mVnd.group(1).replace(".", "");
                return Double.parseDouble(raw);
            } catch (Exception ignored) {}
        }

        return null;
    }

    private String removeAccents(String text) {
        if (text == null) return "";
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replace('đ', 'd').replace('Đ', 'D');
    }
}
