package com.rankwell.admin.controllers;

import java.util.List;
import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.rankwell.admin.entity.Invoice;
import com.rankwell.admin.services.InvoiceService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity; 

@RestController 
@RequestMapping("/invoice")
public class InvoiceController { 

    @Autowired
	public InvoiceService invoiceService;

    @GetMapping("/getAllInvoices") 
    public List<Invoice> getAllInvoices(Principal principal) {
        return invoiceService.getAllInvoices(principal.getName());
    }
	

    @GetMapping("/coursePurchasedCount/{courseId}")
    public ResponseEntity<Long> getCoursePurchaseCount(@PathVariable Long courseId) {

        Long count = invoiceService.getCoursePurchaseCount(courseId);

        return ResponseEntity.ok(count);
    }

    // @GetMapping("/getAllInvoices") 
    // public List<InvoiceDto> getAllInvoices(Principal principal) {

    //     // List<InvoiceDto> invoices = invoiceService.getAllInvoices(principal.getName());

    //     // return ResponseEntity.ok(invoices);

    //     return invoiceService.getAllInvoices(principal.getName());
    // }


}
