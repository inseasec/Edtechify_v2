package com.rankwell.admin.dto;
import java.time.LocalDateTime;
import java.util.List;
import com.rankwell.admin.entity.Users;
import com.rankwell.admin.entity.Payment;

public class InvoiceDto {

    private Long id;
    private String invoiceNumber;
    private String invoiceId;
    private LocalDateTime invoiceDate;
    private Long totalAmount;
    private Long taxAmount;
    private String billingAddress;
    private Long invoiceDiscount;
    private Long invoiceTaxRate;

    // ✅ Full object references
    private Users user;
    private Payment payment;
    private List<Object> courses;


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

    public String getBillingAddress() {
        return billingAddress;
    }

    public void setBillingAddress(String billingAddress) {
        this.billingAddress = billingAddress;
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

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }

//    public List<Object> getCourses() {
//        return courses;
//    }
//
//    public void setCourses(List<Object> courses) {
//        this.courses = courses;
//    }
}