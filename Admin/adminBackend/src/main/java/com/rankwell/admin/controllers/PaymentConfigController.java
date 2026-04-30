package com.rankwell.admin.controllers;

import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.rankwell.admin.services.PaymentConfigService;
import com.rankwell.admin.entity.PaymentGatewayConfig;
import com.rankwell.admin.repository.AdminRepository;
import org.springframework.http.ResponseEntity;
import com.rankwell.admin.entity.Admins;
import com.rankwell.admin.entity.Admins.Role;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/paymentConfig")
public class PaymentConfigController {

    @Autowired
    private PaymentConfigService paymentConfigService;

    // // Save OR Update Configuration
    // @PostMapping("/saveOrUpdate")
    // public PaymentGatewayConfig saveOrUpdateConfig(@RequestBody PaymentGatewayConfig config) {
    //     return paymentConfigService.saveOrUpdateConfig(config);
    // }

    // // Fetch Configuration
    // @GetMapping("/getConfigDetails")
    // public PaymentGatewayConfig getConfigDetails() {
    //     return paymentConfigService.getConfig();
    // }

    @Autowired
	private AdminRepository adminRepository;

    // Save OR Update Configuration
    @PostMapping("/saveOrUpdate")
    public ResponseEntity<?> saveOrUpdateConfig(@RequestBody PaymentGatewayConfig config, Principal principal) {

        String loggedInEmail = principal.getName();

        Admins loggedInAdmin = adminRepository.findByEmail(loggedInEmail) 
				.orElseThrow(() -> new IllegalArgumentException("LoggedIn Admin Not Found"));
		
		if(loggedInAdmin.getRole() != Admins.Role.SUPER_ADMIN){
			 return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Only Super Admin can update payment configuration.");
		 }

        return ResponseEntity.ok(paymentConfigService.saveOrUpdateConfig(config));
    }

    // Fetch Configuration
    @GetMapping("/getConfigDetails")
    public ResponseEntity<?> getConfig(Principal principal) {

        String loggedInEmail = principal.getName();

        Admins loggedInAdmin = adminRepository.findByEmail(loggedInEmail) 
				.orElseThrow(() -> new IllegalArgumentException("LoggedIn Admin Not Found"));
		
		if(loggedInAdmin.getRole() != Admins.Role.SUPER_ADMIN){
			 return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Only Super Admin can update payment configuration.");
		 }

        PaymentGatewayConfig config = paymentConfigService.getConfig();
        if (config == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No payment configuration found");
        }


        return ResponseEntity.ok(config);
    }

}