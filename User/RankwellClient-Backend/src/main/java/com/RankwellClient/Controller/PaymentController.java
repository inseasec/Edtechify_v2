package com.RankwellClient.Controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.RankwellClient.dto.RazorpayResponse;
import com.RankwellClient.services.PaymentService;

@RestController
@RequestMapping("/payment")
public class PaymentController {
	
	@Autowired
	private PaymentService paymentService;

    @PostMapping("/createOrder")
    public String createOrder(@RequestBody Map<String,Object> paymentInfo) {
       return paymentService.createOrder(paymentInfo);
    }
    
    @PostMapping("/verifyPayment")
    public ResponseEntity<?> verifyPayment(@RequestBody RazorpayResponse response) throws Exception {
    	return paymentService.verifyPayment(response);
    }
    
    




    
}

