package com.phuquy.furniture.repository;

import com.phuquy.furniture.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    List<PaymentTransaction> findByOrderCodeOrderByCreatedAtDesc(String orderCode);

    Optional<PaymentTransaction> findByTransactionNo(String transactionNo);
}
