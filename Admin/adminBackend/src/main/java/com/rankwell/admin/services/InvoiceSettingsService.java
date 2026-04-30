package com.rankwell.admin.services;

import com.rankwell.admin.entity.InvoiceSettings;

public interface InvoiceSettingsService { 

	InvoiceSettings saveOrUpdateInvoiceValues(InvoiceSettings invoiceSettings, String loggedInAdminEmail);

	InvoiceSettings getInvoiceValues(String loggedInAdminEmail);

	InvoiceSettings saveOrUpdateNewSerialNo(InvoiceSettings invoiceSettings, String loggedInAdminEmail); 
}