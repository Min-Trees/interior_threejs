package com.phuquy.furniture.controller;

import com.phuquy.furniture.dto.request.AppointmentRequest;
import com.phuquy.furniture.dto.response.ApiResponse;
import com.phuquy.furniture.dto.response.AppointmentDTO;
import com.phuquy.furniture.dto.response.PageResponse;
import com.phuquy.furniture.entity.ShowroomAppointment;
import com.phuquy.furniture.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentDTO>> createAppointment(@Valid @RequestBody AppointmentRequest request) {
        AppointmentDTO dto = appointmentService.createAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đặt lịch hẹn trải nghiệm showroom thành công! Chuyên viên Phú Quý sẽ liên hệ sớm nhất.", dto));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentDTO>>> getAllAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getAllAppointments(page, size)));
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam ShowroomAppointment.AppointmentStatus status
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái lịch hẹn thành công", appointmentService.updateStatus(id, status)));
    }
}
