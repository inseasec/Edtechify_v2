package com.rankwell.admin.serviceImpl;

import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.stereotype.Service;
import com.rankwell.admin.entity.InvoiceSettings;
import com.rankwell.admin.services.InvoiceSettingsService;
import com.rankwell.admin.repository.AdminRepository;
import com.rankwell.admin.repository.InvoiceSettingsRepository;
import com.rankwell.admin.entity.Admins;


@Service
public class InvoiceSettingsServiceImpl implements InvoiceSettingsService{


    @Autowired
	private AdminRepository adminRepository;

    @Autowired
    private InvoiceSettingsRepository invoiceSettingsRepository;

    @Override
    public InvoiceSettings saveOrUpdateInvoiceValues(InvoiceSettings invoiceSettings, String loggedInAdminEmail) {

        Admins admin = adminRepository.findByEmail(loggedInAdminEmail).orElseThrow(() 
				-> new RuntimeException("Admin Not Found"));

        InvoiceSettings existingInvoiceSettings = invoiceSettingsRepository.findTopByOrderByIdAsc().orElse(null);

        if (existingInvoiceSettings != null) {
            // Update existing config
            existingInvoiceSettings.setInvoicePrefix(invoiceSettings.getInvoicePrefix());
            existingInvoiceSettings.setInvoiceYear(invoiceSettings.getInvoiceYear());
            existingInvoiceSettings.setInvoiceSuffix(invoiceSettings.getInvoiceSuffix());
            existingInvoiceSettings.setInvoiceDiscount(invoiceSettings.getInvoiceDiscount());
            existingInvoiceSettings.setInvoiceTaxRate(invoiceSettings.getInvoiceTaxRate());
            existingInvoiceSettings.setInvoiceGST(invoiceSettings.getInvoiceGST());

            return invoiceSettingsRepository.save(existingInvoiceSettings);
        }

        // Save new config
        return invoiceSettingsRepository.save(invoiceSettings);
    }

    @Override
	public InvoiceSettings getInvoiceValues(String loggedInAdminEmail) {

         Admins admin = adminRepository.findByEmail(loggedInAdminEmail).orElseThrow(() 
				-> new RuntimeException("Admin Not Found"));

        return invoiceSettingsRepository.findTopByOrderByIdAsc().orElse(null);
    }


    @Override
    public InvoiceSettings saveOrUpdateNewSerialNo(InvoiceSettings invoiceSettings, String loggedInAdminEmail) {

        Admins admin = adminRepository.findByEmail(loggedInAdminEmail).orElseThrow(() 
				-> new RuntimeException("Admin Not Found"));

        InvoiceSettings existingInvoiceSettings = invoiceSettingsRepository.findTopByOrderByIdAsc().orElse(null);

        if (existingInvoiceSettings != null) {
            // Update existing config
            existingInvoiceSettings.setUpdateSerialNo(invoiceSettings.getUpdateSerialNo());
            return invoiceSettingsRepository.save(existingInvoiceSettings);
        }

        // Save new config
        return invoiceSettingsRepository.save(invoiceSettings);
    }
}