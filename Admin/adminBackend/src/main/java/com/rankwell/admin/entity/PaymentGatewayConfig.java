package com.rankwell.admin.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "payment_gateway_config")
public class PaymentGatewayConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String razorpayKey;

    private String razorpaySecret;

    private Boolean isActive;

    // Default Constructor
    public PaymentGatewayConfig() {
    }

    // Parameterized Constructor
    public PaymentGatewayConfig(Long id, String razorpayKey, String razorpaySecret, Boolean isActive) {
        this.id = id;
        this.razorpayKey = razorpayKey;
        this.razorpaySecret = razorpaySecret;
        this.isActive = isActive;
    }

    // Getter and Setter for id
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // Getter and Setter for razorpayKey
    public String getRazorpayKey() {
        return razorpayKey;
    }

    public void setRazorpayKey(String razorpayKey) {
        this.razorpayKey = razorpayKey;
    }

    // Getter and Setter for razorpaySecret
    public String getRazorpaySecret() {
        return razorpaySecret;
    }

    public void setRazorpaySecret(String razorpaySecret) {
        this.razorpaySecret = razorpaySecret;
    }

    // Getter and Setter for isActive
    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}