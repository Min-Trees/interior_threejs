package com.phuquy.furniture.service;

import com.phuquy.furniture.dto.request.AppointmentRequest;
import com.phuquy.furniture.dto.response.AppointmentDTO;
import com.phuquy.furniture.dto.response.PageResponse;
import com.phuquy.furniture.entity.Product;
import com.phuquy.furniture.entity.ShowroomAppointment;
import com.phuquy.furniture.exception.ResourceNotFoundException;
import com.phuquy.furniture.repository.ProductRepository;
import com.phuquy.furniture.repository.ShowroomAppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final ShowroomAppointmentRepository appointmentRepository;
    private final ProductRepository productRepository;

    @Transactional
    public AppointmentDTO createAppointment(AppointmentRequest request) {
        Product product = null;
        if (request.getProductId() != null) {
            product = productRepository.findById(request.getProductId()).orElse(null);
        }

        ShowroomAppointment appointment = ShowroomAppointment.builder()
                .customerName(request.getCustomerName())
                .phone(request.getPhone())
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .note(request.getNote())
                .product(product)
                .status(ShowroomAppointment.AppointmentStatus.PENDING)
                .build();

        appointment = appointmentRepository.save(appointment);
        log.info("New showroom appointment booked: {} - {}", appointment.getCustomerName(), appointment.getPhone());
        return AppointmentDTO.fromEntity(appointment);
    }

    @Transactional(readOnly = true)
    public PageResponse<AppointmentDTO> getAllAppointments(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ShowroomAppointment> appointmentPage = appointmentRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.from(appointmentPage.map(AppointmentDTO::fromEntity));
    }

    @Transactional
    public AppointmentDTO updateStatus(Long id, ShowroomAppointment.AppointmentStatus status) {
        ShowroomAppointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn với ID: " + id));

        appointment.setStatus(status);
        return AppointmentDTO.fromEntity(appointmentRepository.save(appointment));
    }
}
