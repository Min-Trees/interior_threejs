package com.phuquy.furniture.service;

import com.phuquy.furniture.dto.request.AddToCartRequest;
import com.phuquy.furniture.dto.response.CartDTO;
import com.phuquy.furniture.entity.Cart;
import com.phuquy.furniture.entity.CartItem;
import com.phuquy.furniture.entity.Product;
import com.phuquy.furniture.entity.User;
import com.phuquy.furniture.exception.BadRequestException;
import com.phuquy.furniture.exception.ResourceNotFoundException;
import com.phuquy.furniture.repository.CartItemRepository;
import com.phuquy.furniture.repository.CartRepository;
import com.phuquy.furniture.repository.ProductRepository;
import com.phuquy.furniture.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    @Transactional(readOnly = true)
    public CartDTO getCart(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        Cart cart = getOrCreateCart(user);
        return CartDTO.fromEntity(cart);
    }

    @Transactional
    public CartDTO addToCart(String email, AddToCartRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));

        if (!product.getIsActive()) {
            throw new BadRequestException("Sản phẩm hiện đang tạm ngừng kinh doanh");
        }

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new BadRequestException("Số lượng trong kho không đủ (Hiện còn: " + product.getStockQuantity() + ")");
        }

        Cart cart = getOrCreateCart(user);

        BigDecimal currentPrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem item = existingItemOpt.get();
            int newQty = item.getQuantity() + request.getQuantity();
            if (newQty > product.getStockQuantity()) {
                throw new BadRequestException("Số lượng vượt quá tồn kho hiện có (" + product.getStockQuantity() + ")");
            }
            item.setQuantity(newQty);
            item.setPrice(currentPrice);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .price(currentPrice)
                    .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        return CartDTO.fromEntity(cart);
    }

    @Transactional
    public CartDTO updateCartItemQuantity(String email, Long itemId, int quantity) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm trong giỏ hàng"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Sản phẩm này không thuộc giỏ hàng của bạn");
        }

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            if (quantity > item.getProduct().getStockQuantity()) {
                throw new BadRequestException("Số lượng tồn kho không đủ (Còn: " + item.getProduct().getStockQuantity() + ")");
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return CartDTO.fromEntity(cart);
    }

    @Transactional
    public CartDTO removeCartItem(String email, Long itemId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm trong giỏ hàng"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Sản phẩm này không thuộc giỏ hàng của bạn");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return CartDTO.fromEntity(cart);
    }

    @Transactional
    public void clearCart(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        cartItemRepository.deleteByCartId(cart.getId());
    }
}
