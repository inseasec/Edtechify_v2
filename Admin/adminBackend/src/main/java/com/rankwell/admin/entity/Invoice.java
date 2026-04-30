package com.rankwell.admin.entity;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.ManyToMany;
import com.fasterxml.jackson.annotation.JsonManagedReference;


@Entity
public class Invoice {  
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id; 
	
	@Column(unique = true)
	private String invoiceNumber;
	private String invoiceId;
	private LocalDateTime invoiceDate;
	private Long totalAmount;  //amount + tax
	private Long taxAmount;
	private String billingAddress;
	private Long invoiceDiscount;
	private Long invoiceTaxRate;
	
	@ManyToOne
	@JoinColumn(name = "user_id")
	private Users users;

	@ManyToOne
	@JoinColumn(name = "payment_id")
	private Payment payment;

//	@ManyToMany
//	@JoinTable(name = "invoice_course", joinColumns = @JoinColumn(name = "invoice_id"), inverseJoinColumns = @JoinColumn(name = "course_id"))
//	@JsonManagedReference
//	private List<Courses> courses;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getInvoiceNumber() {
		return invoiceNumber;
	}

	public void setInvoiceNumber(String invoiceNumber) {
		this.invoiceNumber = invoiceNumber;
	}

	public String getInvoiceId() {
		return invoiceId;
	}

	public void setInvoiceId(String invoiceId) {
		this.invoiceId = invoiceId;
	}

	public LocalDateTime getInvoiceDate() {
		return invoiceDate;
	}

	public void setInvoiceDate(LocalDateTime invoiceDate) {
		this.invoiceDate = invoiceDate;
	}
	public String getBillingAddress() {
		return billingAddress;
	}

	public void setBillingAddress(String billingAddress) {
		this.billingAddress = billingAddress;
	}

	public Users getUsers() {
		return users;
	}

	public void setUsers(Users users) {
		this.users = users;
	}

	public Payment getPayment() {
		return payment;
	}

	public void setPayment(Payment payment) {
		this.payment = payment;
	}
	public Long getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(Long totalAmount) {
		this.totalAmount = totalAmount;
	}

	public Long getTaxAmount() {
		return taxAmount;
	}

	public void setTaxAmount(Long taxAmount) {
		this.taxAmount = taxAmount;
	}

	 public Long getInvoiceDiscount() {
		return invoiceDiscount;
	}

	public void setInvoiceDiscount(Long invoiceDiscount) {
		this.invoiceDiscount = invoiceDiscount;
	}

	public Long getInvoiceTaxRate() {
		return invoiceTaxRate;
	}

	public void setInvoiceTaxRate(Long invoiceTaxRate) {
		this.invoiceTaxRate = invoiceTaxRate;
	}

//	public List<Courses> getCourses() {
//		return courses;
//	}
//	public void setCourses(List<Courses> courses) {
//		this.courses = courses;
//	}

	public Invoice() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Invoice(Long id, String invoiceNumber,String invoiceId, LocalDateTime invoiceDate, Long totalAmount, Long taxAmount,
			String billingAddress, Users users, Payment payment, Long invoiceDiscount,Long invoiceTaxRate) {
		super();
		this.id = id;
		this.invoiceNumber = invoiceNumber;
		this.invoiceId = invoiceId;
		this.invoiceDate = invoiceDate;
		this.totalAmount = totalAmount;
		this.taxAmount = taxAmount;
		this.billingAddress = billingAddress;
		this.users = users;
		this.payment = payment;
		this.invoiceDiscount = invoiceDiscount;
		this.invoiceTaxRate = invoiceTaxRate;
	}
	
	

}
