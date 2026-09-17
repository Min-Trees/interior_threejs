package com.phuquy.furniture.controller;

import com.phuquy.furniture.dto.response.ApiResponse;
import com.phuquy.furniture.dto.response.ProductDTO;
import com.phuquy.furniture.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getMyWishlist(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<ProductDTO> list = wishlistService.getUserWishlist(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách yêu thích thành công", list));
    }

    @PostMapping("/{productId}/toggle")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleWishlist(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        boolean inWishlist = wishlistService.toggleWishlist(userDetails.getUsername(), productId);
        String message = inWishlist ? "Đã thêm vào danh sách yêu thích" : "Đã xóa khỏi danh sách yêu thích";
        return ResponseEntity.ok(ApiResponse.success(message, Map.of("inWishlist", inWishlist)));
    }

    @GetMapping("/{productId}/status")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> getWishlistStatus(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        boolean inWishlist = false;
        if (userDetails != null) {
            inWishlist = wishlistService.isInWishlist(userDetails.getUsername(), productId);
        }
        return ResponseEntity.ok(ApiResponse.success(Map.of("inWishlist", inWishlist)));
    }
}
