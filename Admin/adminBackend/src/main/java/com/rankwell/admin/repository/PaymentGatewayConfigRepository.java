package com.rankwell.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import com.rankwell.admin.entity.PaymentGatewayConfig;

public interface PaymentGatewayConfigRepository extends JpaRepository<PaymentGatewayConfig, Long> {

    Optional<PaymentGatewayConfig> findTopByOrderByIdAsc();
} 