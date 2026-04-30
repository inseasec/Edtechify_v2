package com.rankwell.admin.services;

import com.rankwell.admin.entity.PaymentGatewayConfig;

public interface PaymentConfigService {

    PaymentGatewayConfig saveOrUpdateConfig(PaymentGatewayConfig config);

    PaymentGatewayConfig getConfig();   
    
}

 
