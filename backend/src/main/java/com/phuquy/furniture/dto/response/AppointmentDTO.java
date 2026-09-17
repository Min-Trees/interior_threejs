package com.phuquy.furniture.dto.response;

import com.phuquy.furniture.entity.ShowroomAppointment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {
    private Long id;
    private String customerName;
    private String phone;
    private LocalDate appointmentDate;
    private String appointmentTime;
    private String note;
    private Long productId;
    private String productName;
    private String productThumbnail;
    private String status;
    private LocalDateTime createdAt;

    public static AppointmentDTO fromEntity(ShowroomAppointment a) {
        return AppointmentDTO.builder()
                .id(a.getId())
                .customerName(a.getCustomerName())
                .phone(a.getPhone())
                .appointmentDate(a.getAppointmentDate())
                .appointmentTime(a.getAppointmentTime())
                .note(a.getNote())
                .productId(a.getProduct() != null ? a.getProduct().getId() : null)
                .productName(a.getProduct() != null ? a.getProduct().getName() : null)
                .productThumbnail(a.getProduct() != null ? a.getProduct().getThumbnail() : null)
                .status(a.getStatus().name())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
