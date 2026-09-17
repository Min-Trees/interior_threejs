package com.phuquy.furniture.service;

import com.phuquy.furniture.dto.request.UpdateProfileRequest;
import com.phuquy.furniture.dto.response.PageResponse;
import com.phuquy.furniture.dto.response.UserResponse;
import com.phuquy.furniture.entity.User;
import com.phuquy.furniture.exception.BadRequestException;
import com.phuquy.furniture.exception.ResourceNotFoundException;
import com.phuquy.furniture.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());

        return UserResponse.fromEntity(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.from(userPage.map(UserResponse::fromEntity));
    }

    @Transactional
    public UserResponse toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        if (user.getRole().getName().equals("ROLE_ADMIN")) {
            throw new BadRequestException("Không thể khóa tài khoản quản trị viên tối cao");
        }

        user.setStatus(user.getStatus() == User.UserStatus.ACTIVE ? User.UserStatus.BLOCKED : User.UserStatus.ACTIVE);
        return UserResponse.fromEntity(userRepository.save(user));
    }
}
