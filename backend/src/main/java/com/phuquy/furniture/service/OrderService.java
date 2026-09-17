package com.phuquy.furniture.service;

import com.phuquy.furniture.dto.request.CreateOrderRequest;
import com.phuquy.furniture.dto.request.UpdateOrderStatusRequest;
import com.phuquy.furniture.dto.response.DashboardStatsDTO;
import com.phuquy.furniture.dto.response.OrderDTO;
import com.phuquy.furniture.dto.response.PageResponse;
import com.phuquy.furniture.entity.*;
import com.phuquy.furniture.exception.BadRequestException;
import com.phuquy.furniture.exception.ResourceNotFoundException;
import com.phuquy.furniture.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final VoucherService voucherService;

    @Transactional
    public OrderDTO createOrder(String email, CreateOrderRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Giỏ hàng của bạn đang trống"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Giỏ hàng của bạn đang trống, không thể đặt hàng");
        }

        // Tạo mã đơn hàng độc nhất
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmm"));
        int randomSuffix = ThreadLocalRandom.current().nextInt(1000, 9999);
        String orderCode = "PQ-" + timestamp + "-" + randomSuffix;

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .shippingFee(BigDecimal.ZERO)
                .status(Order.OrderStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(Order.PaymentStatus.UNPAID)
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .shippingAddress(request.getShippingAddress())
                .note(request.getNote())
                .build();

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Sản phẩm '" + product.getName() + "' không đủ số lượng trong kho");
            }

            // Trừ số lượng tồn kho
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            BigDecimal unitPrice = cartItem.getPrice();
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .productThumbnail(product.getThumbnail())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(itemTotal)
                    .build();

            orderItems.add(orderItem);
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        String voucherCode = null;
        if (request.getVoucherCode() != null && !request.getVoucherCode().isBlank()) {
            voucherCode = request.getVoucherCode().trim().toUpperCase();
            com.phuquy.furniture.dto.request.ApplyVoucherRequest applyReq = new com.phuquy.furniture.dto.request.ApplyVoucherRequest();
            applyReq.setCode(voucherCode);
            applyReq.setOrderAmount(totalAmount);
            com.phuquy.furniture.dto.response.ApplyVoucherResponse voucherRes = voucherService.calculateDiscount(applyReq);
            discountAmount = voucherRes.getDiscountAmount();
            totalAmount = voucherRes.getFinalAmount();
            voucherService.recordVoucherUsage(voucherCode);
        }

        order.setDiscountAmount(discountAmount);
        order.setVoucherCode(voucherCode);
        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        // Làm rỗng giỏ hàng
        cart.getItems().clear();
        cartItemRepository.deleteByCartId(cart.getId());

        log.info("Order created successfully: {} by {}", savedOrder.getOrderCode(), user.getEmail());
        return OrderDTO.fromEntity(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getUserOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderByCode(String orderCode, String email) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng: " + orderCode));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        boolean isAdmin = user.getRole().getName().equals(Role.ROLE_ADMIN);
        if (!isAdmin && (order.getUser() == null || !order.getUser().getId().equals(user.getId()))) {
            throw new BadRequestException("Bạn không có quyền xem đơn hàng này");
        }

        return OrderDTO.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderDTO> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orderPage = orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.from(orderPage.map(OrderDTO::fromEntity));
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        order.setStatus(request.getStatus());
        if (request.getPaymentStatus() != null) {
            order.setPaymentStatus(request.getPaymentStatus());
        }

        return OrderDTO.fromEntity(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        long totalOrders = orderRepository.countTotalOrders();
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        long totalProducts = productRepository.count();
        long totalUsers = userRepository.count();

        return DashboardStatsDTO.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .totalOrders(totalOrders)
                .totalProducts(totalProducts)
                .totalUsers(totalUsers)
                .build();
    }
}
