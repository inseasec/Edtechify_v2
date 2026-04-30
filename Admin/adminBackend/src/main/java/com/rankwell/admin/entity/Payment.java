package com.rankwell.admin.entity;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.JoinTable;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.ManyToMany;


@Entity
public class Payment {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String orderId;
	
	private Long amount;

	// private double amountInRupees;
	
	@Enumerated(EnumType.STRING)
	private PaymentStatus status;
	
	private String paymentId;
	
	private LocalDateTime createdOn;
	
	@ManyToOne
	@JoinColumn(name = "user_id")
	private Users user;

	// @ManyToOne
	// @JoinColumn(name = "course_id")
	// private Courses courses;

//	@ManyToMany
//	@JoinTable(name = "payment_course", joinColumns = @JoinColumn(name = "payment_id"), inverseJoinColumns = @JoinColumn(name = "course_id"))
//	private List<Courses> courses;
	
	public enum PaymentStatus{
		CREATED, FAILED, EXPIRED, PAID
	}
	
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

	// public double getAmountInRupees() {
	// 	return amountInRupees;
	// }

	// public void setAmountInRupees(double amountInRupees) {
	// 	this.amountInRupees = amountInRupees;
	// }

	public PaymentStatus getStatus() {
		return status;
	}

	public void setStatus(PaymentStatus status) {
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

	public Users getUser() {
		return user;
	}

	public void setUser(Users user) {
		this.user = user;
	}

	// public Courses getCourses() {
	// 	return courses;
	// }

	// public void setCourses(Courses courses) {
	// 	this.courses = courses;
	// }

//	public List<Courses> getCourses() {
//		return courses;
//	}
//	public void setCourses(List<Courses> courses) {
//		this.courses = courses;
//	}

	public Payment(Long id, String orderId, Long amount, PaymentStatus status, String paymentId,
			LocalDateTime createdOn, Users user) {
		super();
		this.id = id;
		this.orderId = orderId;
		this.amount = amount;
		this.status = status;
		this.paymentId = paymentId;
		this.createdOn = createdOn;
		this.user = user;
//		this.courses = courses;
		// this.amountInRupees = amountInRupees;
	}

	public Payment() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	

}
