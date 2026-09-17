package com.phuquy.furniture.repository;

import com.phuquy.furniture.entity.ShowroomAppointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShowroomAppointmentRepository extends JpaRepository<ShowroomAppointment, Long> {
    List<ShowroomAppointment> findByPhoneOrderByCreatedAtDesc(String phone);
    Page<ShowroomAppointment> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(ShowroomAppointment.AppointmentStatus status);
}
