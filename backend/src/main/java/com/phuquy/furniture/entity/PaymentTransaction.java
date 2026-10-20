package com.phuquy.furniture.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(nullable = false, length = 64)
    private String orderCode;

    @Column(length = 64)
    private String transactionNo; // Mã giao dịch ghi nhận tại cổng VNPAY

    @Column(length = 30)
    private String bankCode; // VCB, NCB, VISA, CTG...

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(length = 30)
    private String cardType; // ATM, QR, CREDIT...

    @Column(length = 30)
    @Builder.Default
    private String paymentMethod = "VNPAY";

    @Column(nullable = false, length = 30)
    private String status; // SUCCESS, FAILED, PENDING

    @Column(length = 20)
    private String responseCode; // 00 = Thành công

    @Column(columnDefinition = "TEXT")
    private String orderInfo;

    @Column(length = 30)
    private String payDate;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
