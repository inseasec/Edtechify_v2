package com.RankwellClient.ServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.RankwellClient.entity.PaymentGatewayConfig;
import com.RankwellClient.repository.PaymentGatewayConfigRepository;
import com.RankwellClient.services.PaymentConfigService;

@Service
public class PaymentConfigServiceImpl implements PaymentConfigService {

    @Autowired
    private PaymentGatewayConfigRepository paymentConfigRepository;

    @Override
    public PaymentGatewayConfig getConfig() {
        return paymentConfigRepository.findTopByOrderByIdAsc().orElse(null);
    }
}
