package com.RankwellClient.Controller;

import java.util.Map;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.RankwellClient.repository.InvoiceRepository;
import com.RankwellClient.services.InvoiceService;

import org.springframework.web.bind.annotation.PathVariable;
import com.RankwellClient.entity.Invoice;
//import com.RankwellClient.services.InvoiceService;

@RestController 
@RequestMapping("/invoice")
public class InvoiceController { 

	@Autowired
	public InvoiceRepository invoiceRepository;

    @Autowired
	public InvoiceService invoiceService;
	
	@GetMapping("/getInvoiceSettings")
    public Map<String, Object> getInvoiceSettings() {
        return invoiceRepository.getInvoiceSettings();
    }

    @GetMapping("/getInvoiceByUserId/{userId}") 
    public List<Invoice> getInvoiceByUserId(@PathVariable Long userId) {
        return invoiceService.getInvoiceByUserId(userId);
    }
}