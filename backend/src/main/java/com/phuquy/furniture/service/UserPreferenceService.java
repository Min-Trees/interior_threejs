package com.phuquy.furniture.service;

import com.phuquy.furniture.entity.User;
import com.phuquy.furniture.entity.UserPreference;
import com.phuquy.furniture.repository.UserPreferenceRepository;
import com.phuquy.furniture.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserPreferenceService {

    private final UserPreferenceRepository userPreferenceRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Optional<UserPreference> getPreference(String userEmail, String sessionId) {
        if (userEmail != null) {
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isPresent()) {
                Optional<UserPreference> pref = userPreferenceRepository.findByUserId(userOpt.get().getId());
                if (pref.isPresent()) return pref;
            }
        }
        if (sessionId != null && !sessionId.isBlank()) {
            return userPreferenceRepository.findBySessionId(sessionId);
        }
        return Optional.empty();
    }

    @Transactional
    public void updateUserPreference(String userEmail, String sessionId, String userMessage) {
        if (userMessage == null || userMessage.isBlank()) return;
        String lower = userMessage.toLowerCase();

        User user = null;
        if (userEmail != null) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }

        final User finalUser = user;
        UserPreference pref = getPreference(userEmail, sessionId)
                .orElseGet(() -> UserPreference.builder()
                        .user(finalUser)
                        .sessionId(sessionId)
                        .build());

        boolean updated = false;

        // Nhận diện phong cách
        if (lower.contains("hiện đại") || lower.contains("modern")) {
            pref.setPreferredStyle("Hiện Đại (Modern)");
            updated = true;
        } else if (lower.contains("tối giản") || lower.contains("minimalist") || lower.contains("nhật bản") || lower.contains("japandi")) {
            pref.setPreferredStyle("Tối Giản (Minimalism / Japandi)");
            updated = true;
        } else if (lower.contains("bắc âu") || lower.contains("scandinavian")) {
            pref.setPreferredStyle("Bắc Âu (Scandinavian)");
            updated = true;
        } else if (lower.contains("tân cổ điển") || lower.contains("classic")) {
            pref.setPreferredStyle("Tân Cổ Điển (Neo-Classic)");
            updated = true;
        }

        // Nhận diện không gian phòng
        if (lower.contains("phòng khách")) {
            pref.setRoomType("Phòng Khách");
            updated = true;
        } else if (lower.contains("phòng ngủ")) {
            pref.setRoomType("Phòng Ngủ");
            updated = true;
        } else if (lower.contains("phòng làm việc") || lower.contains("bàn làm việc")) {
            pref.setRoomType("Phòng Làm Việc");
            updated = true;
        } else if (lower.contains("phòng ăn") || lower.contains("bàn ăn")) {
            pref.setRoomType("Phòng Bếp / Ăn");
            updated = true;
        }

        // Nhận diện chất liệu ưa chuộng
        if (lower.contains("da bò") || lower.contains("da thật") || lower.contains("nappa")) {
            pref.setFavoriteMaterials("Da Bò Ý Cao Cấp");
            updated = true;
        } else if (lower.contains("gỗ óc chó") || lower.contains("walnut")) {
            pref.setFavoriteMaterials("Gỗ Óc Chó Bắc Mỹ");
            updated = true;
        } else if (lower.contains("gỗ sồi") || lower.contains("sồi")) {
            pref.setFavoriteMaterials("Gỗ Sồi Tự Nhiên");
            updated = true;
        }

        // Nhận diện ngân sách
        if (lower.contains("dưới 10 triệu") || lower.contains("< 10tr") || lower.contains("giá rẻ")) {
            pref.setBudgetRange("Tiết kiệm (< 10 triệu)");
            updated = true;
        } else if (lower.contains("10 đến 20 triệu") || lower.contains("tầm 15") || lower.contains("20 triệu")) {
            pref.setBudgetRange("Trung cấp (10 - 20 triệu)");
            updated = true;
        } else if (lower.contains("cao cấp") || lower.contains("sang trọng") || lower.contains("trên 30 triệu") || lower.contains("50 triệu")) {
            pref.setBudgetRange("Cao cấp hạng sang (> 30 triệu)");
            updated = true;
        }

        if (updated) {
            String summary = String.format("Sở thích: Phong cách %s | Không gian: %s | Chất liệu: %s | Ngân sách: %s",
                    pref.getPreferredStyle() != null ? pref.getPreferredStyle() : "Chưa rõ",
                    pref.getRoomType() != null ? pref.getRoomType() : "Chưa rõ",
                    pref.getFavoriteMaterials() != null ? pref.getFavoriteMaterials() : "Chưa rõ",
                    pref.getBudgetRange() != null ? pref.getBudgetRange() : "Chưa rõ");
            pref.setSummary(summary);
            userPreferenceRepository.save(pref);
            log.info("Updated customer profile memory: {}", summary);
        }
    }
}
