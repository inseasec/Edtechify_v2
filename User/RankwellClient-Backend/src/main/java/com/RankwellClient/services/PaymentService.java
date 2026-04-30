package com.RankwellClient.services;

import java.util.Map;

import org.springframework.http.ResponseEntity;

import com.RankwellClient.dto.RazorpayResponse;

public interface PaymentService {

	String createOrder(Map<String,Object> paymentInfo);

	ResponseEntity<?> verifyPayment(RazorpayResponse response) throws Exception;
	
    

}
