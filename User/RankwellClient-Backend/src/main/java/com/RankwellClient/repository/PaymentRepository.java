package com.RankwellClient.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.RankwellClient.entity.Payment;
import com.RankwellClient.entity.Payment.PaymentStatus;

public interface PaymentRepository extends JpaRepository<Payment, Long>{

	Payment findByOrderId(String orderId);

	List<Payment> findByStatusAndCreatedOnBefore(PaymentStatus created, LocalDateTime threshold);
	
	//  boolean existsByUserIdAndCourseId(Long userId, Long courseId);

}
