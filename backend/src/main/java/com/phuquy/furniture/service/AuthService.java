package com.phuquy.furniture.service;

import com.phuquy.furniture.dto.request.LoginRequest;
import com.phuquy.furniture.dto.request.RegisterRequest;
import com.phuquy.furniture.dto.response.AuthResponse;
import com.phuquy.furniture.dto.response.UserResponse;
import com.phuquy.furniture.entity.Cart;
import com.phuquy.furniture.entity.Role;
import com.phuquy.furniture.entity.User;
import com.phuquy.furniture.exception.BadRequestException;
import com.phuquy.furniture.exception.ResourceNotFoundException;
import com.phuquy.furniture.repository.CartRepository;
import com.phuquy.furniture.repository.RoleRepository;
import com.phuquy.furniture.repository.UserRepository;
import com.phuquy.furniture.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email '" + request.getEmail() + "' đã được sử dụng.");
        }

        Role customerRole = roleRepository.findByName(Role.ROLE_CUSTOMER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(Role.ROLE_CUSTOMER).build()));

        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(customerRole)
                .status(User.UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        // Tạo giỏ hàng tự động cho user
        Cart cart = Cart.builder()
                .user(user)
                .build();
        cartRepository.save(cart);

        String token = tokenProvider.generateToken(user.getEmail(), customerRole.getName());
        log.info("User registered successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.fromEntity(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim().toLowerCase(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));

        if (user.getStatus() == User.UserStatus.BLOCKED) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().getName());
        log.info("User logged in successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.fromEntity(user))
                .build();
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));
        return UserResponse.fromEntity(user);
    }
}
