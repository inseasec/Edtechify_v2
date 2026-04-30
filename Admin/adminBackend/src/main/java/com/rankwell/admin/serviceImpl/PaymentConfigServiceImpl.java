package com.rankwell.admin.serviceImpl;

import org.springframework.stereotype.Service;
import com.rankwell.admin.repository.PaymentGatewayConfigRepository;
import com.rankwell.admin.services.PaymentConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import com.rankwell.admin.entity.PaymentGatewayConfig;

@Service
public class PaymentConfigServiceImpl implements PaymentConfigService {

    @Autowired
    private PaymentGatewayConfigRepository repository;

    @Override
    public PaymentGatewayConfig saveOrUpdateConfig(PaymentGatewayConfig config) {

        PaymentGatewayConfig existingConfig = repository.findTopByOrderByIdAsc().orElse(null);

        if (existingConfig != null) {
            // Update existing config
            existingConfig.setRazorpayKey(config.getRazorpayKey());
            existingConfig.setRazorpaySecret(config.getRazorpaySecret());
            existingConfig.setIsActive(true);

            return repository.save(existingConfig);
        }

        // Save new config
        config.setIsActive(true);
        return repository.save(config);
    }

    @Override
    public PaymentGatewayConfig getConfig() {
        return repository.findTopByOrderByIdAsc().orElse(null);
    }
}