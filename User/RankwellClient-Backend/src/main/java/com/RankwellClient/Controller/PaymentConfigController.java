package com.RankwellClient.Controller;

import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.RankwellClient.services.PaymentConfigService;
import com.RankwellClient.entity.PaymentGatewayConfig;
import org.springframework.http.ResponseEntity;
import java.util.Optional;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/paymentConfig")
public class PaymentConfigController {

    @Autowired
    private PaymentConfigService paymentConfigService;

    // Fetch Configuration
    @GetMapping("/getConfigDetails")
    public ResponseEntity<?> getConfig() {
        PaymentGatewayConfig config = paymentConfigService.getConfig();
        if (config == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No payment configuration found");
        }
        return ResponseEntity.ok(config);
    }

}