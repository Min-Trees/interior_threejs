package com.phuquy.furniture.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AppointmentRequest {

    @NotBlank(message = "Họ tên không được để trống")
    private String customerName;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;

    @NotNull(message = "Ngày hẹn không được để trống")
    private LocalDate appointmentDate;

    private String appointmentTime = "Sáng (9h - 11h30)";

    private String note;

    private Long productId;
}
