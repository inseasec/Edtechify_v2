package com.RankwellClient.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class InvoiceSettings { 
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id; 
	
	private String invoicePrefix;
	private String invoiceYear;
	private String invoiceSuffix; // Serial No.
	private boolean updateSerialNo; // Start with new serial no.
	private Long invoiceDiscount;
	private Long invoiceTaxRate;


	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getInvoicePrefix() {
		return invoicePrefix;
	}

	public void setInvoicePrefix(String invoicePrefix) {
		this.invoicePrefix = invoicePrefix;
	}

	public String getInvoiceYear() {
		return invoiceYear;
	}

	public void setInvoiceYear(String invoiceYear) {
		this.invoiceYear = invoiceYear;
	}

    public String getInvoiceSuffix() {
		return invoiceSuffix;
	}

	public void setInvoiceSuffix(String invoiceSuffix) {
		this.invoiceSuffix = invoiceSuffix;
	}

	public boolean getUpdateSerialNo() {
		return updateSerialNo;
	}

	public void setUpdateSerialNo(boolean updateSerialNo) {
		this.updateSerialNo = updateSerialNo;
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

    public InvoiceSettings() {
	}


	public InvoiceSettings(Long id, String invoicePrefix, String invoiceYear, String invoiceSuffix, Long invoiceDiscount, Long invoiceTaxRate, boolean updateSerialNo) {
		super();
		this.id = id;
		this.invoicePrefix = invoicePrefix;
		this.invoiceYear = invoiceYear;
		this.invoiceSuffix = invoiceSuffix;
		this.invoiceDiscount = invoiceDiscount;
		this.invoiceTaxRate = invoiceTaxRate;
		this.updateSerialNo = updateSerialNo;
	}
	
	

}
