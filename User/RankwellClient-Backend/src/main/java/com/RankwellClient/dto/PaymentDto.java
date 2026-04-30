package com.RankwellClient.dto;

import java.time.LocalDateTime;

public class PaymentDto {
	
	private Long id;
	private String orderId;
	private Long amount;
	private String status;
    private String paymentId;
	private LocalDateTime createdOn;
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getOrderId() {
		return orderId;
	}
	public void setOrderId(String orderId) {
		this.orderId = orderId;
	}
	public Long getAmount() {
		return amount;
	}
	public void setAmount(Long amount) {
		this.amount = amount;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getPaymentId() {
		return paymentId;
	}
	public void setPaymentId(String paymentId) {
		this.paymentId = paymentId;
	}
	public LocalDateTime getCreatedOn() {
		return createdOn;
	}
	public void setCreatedOn(LocalDateTime createdOn) {
		this.createdOn = createdOn;
	}
	
	public PaymentDto(Long id, String orderId, Long amount, String status, String paymentId, LocalDateTime createdOn) {
		super();
		this.id = id;
		this.orderId = orderId;
		this.amount = amount;
		this.status = status;
		this.paymentId = paymentId;
		this.createdOn = createdOn;
	}
	public PaymentDto() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	

}
