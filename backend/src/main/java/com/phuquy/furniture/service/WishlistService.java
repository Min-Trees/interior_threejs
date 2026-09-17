package com.phuquy.furniture.service;

import com.phuquy.furniture.dto.response.ProductDTO;
import com.phuquy.furniture.entity.Product;
import com.phuquy.furniture.entity.User;
import com.phuquy.furniture.entity.Wishlist;
import com.phuquy.furniture.exception.ResourceNotFoundException;
import com.phuquy.furniture.repository.ProductRepository;
import com.phuquy.furniture.repository.UserRepository;
import com.phuquy.furniture.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<ProductDTO> getUserWishlist(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(w -> ProductDTO.fromEntity(w.getProduct()))
                .collect(Collectors.toList());
    }

    @Transactional
    public boolean toggleWishlist(String email, Long productId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));

        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndProductId(user.getId(), product.getId());
        if (existing.isPresent()) {
            wishlistRepository.delete(existing.get());
            log.info("Removed product {} from user {} wishlist", productId, email);
            return false; // Removed
        } else {
            Wishlist wishlist = Wishlist.builder()
                    .user(user)
                    .product(product)
                    .build();
            wishlistRepository.save(wishlist);
            log.info("Added product {} to user {} wishlist", productId, email);
            return true; // Added
        }
    }

    @Transactional(readOnly = true)
    public boolean isInWishlist(String email, Long productId) {
        return userRepository.findByEmail(email)
                .map(user -> wishlistRepository.existsByUserIdAndProductId(user.getId(), productId))
                .orElse(false);
    }
}
