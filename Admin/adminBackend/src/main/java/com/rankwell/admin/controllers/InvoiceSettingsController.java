package com.rankwell.admin.controllers;

import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rankwell.admin.entity.InvoiceSettings;
import com.rankwell.admin.services.InvoiceSettingsService;

@RestController 
@RequestMapping("/invoiceSettings")
public class InvoiceSettingsController { 

	@Autowired
	public InvoiceSettingsService invoiceSettingsService;
	
	@PostMapping("/setInvoiceValues")
	public InvoiceSettings saveOrUpdateInvoiceValues(@RequestBody InvoiceSettings invoiceSettings, Principal principal) {
		return invoiceSettingsService.saveOrUpdateInvoiceValues(invoiceSettings, principal.getName());
	}

    @GetMapping("/getInvoiceValues")
	public InvoiceSettings getInvoiceValues(Principal principal) {
		return invoiceSettingsService.getInvoiceValues(principal.getName());
	}

	@PostMapping("/setUpdateNewSerialNo")
	public InvoiceSettings saveOrUpdateNewSerialNo(@RequestBody InvoiceSettings invoiceSettings, Principal principal) {
		return invoiceSettingsService.saveOrUpdateNewSerialNo(invoiceSettings, principal.getName());
	}

}