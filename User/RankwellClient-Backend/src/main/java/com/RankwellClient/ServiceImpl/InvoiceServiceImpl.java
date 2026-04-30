package com.RankwellClient.ServiceImpl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.RankwellClient.entity.InvoiceSettings;
import com.RankwellClient.repository.InvoiceSettingsRepository;
import com.RankwellClient.entity.Invoice;
import com.RankwellClient.entity.Payment;
import com.RankwellClient.repository.InvoiceRepository;
import com.RankwellClient.services.InvoiceService;
import java.util.List;
import java.util.Map;

@Service
public class InvoiceServiceImpl implements InvoiceService{
	
	 @Autowired
	 private InvoiceRepository invoiceRepository;

//	 @Autowired
//	 private CourseRepository courseRepository;;

	 @Autowired
	 private InvoiceSettingsRepository invoiceSettingsRepository;;

	    public Invoice generateInvoice(Payment payment) { 
	        Invoice invoice = new Invoice();
	        invoice.setInvoiceNumber(payment.getPaymentId() +" "+ payment.getOrderId()); // invoice no. will be auto generated as the combination of paymentId + orderId
	        invoice.setInvoiceDate(LocalDateTime.now());
	        // Long totalAmount = payment.getAmount(); // in paise 
			Long totalAmount = Math.round(payment.getAmount() / 100.0); // in rupee //50
			System.out.println("₹" + totalAmount);
	        
	        // double taxRate = 0.18; // No hard coded
	        
	        // Calculate tax in rupee
	        // Long taxAmount = Math.round(totalAmount * taxRate / (1 + taxRate));		
	        // invoice.setTaxAmount(taxAmount);

	        invoice.setTotalAmount(totalAmount);
	        invoice.setUsers(payment.getUser());
	        invoice.setPayment(payment);
			// invoice.setCourses(payment.getCourses()); // Set Courses in invoice column list

//			if(payment.getCourses() != null){
//				invoice.setCourses(new ArrayList<>(payment.getCourses()));
//			}

			// == new added chnages here ===//

			// if (payment.getCourses() != null && !payment.getCourses().isEmpty()) {

			// 	List<Long> courseIds = payment.getCourses()
			// 			.stream()
			// 			.map(Courses::getId)
			// 			.toList();

			// 	// Fetch FULL objects from DB
			// 	List<Courses> fullCourses = courseRepository.findAllById(courseIds);

			// 	// Now set properly
			// 	invoice.setCourses(fullCourses);
			// }


	        // return invoiceRepository.save(invoice);

			Map<String, Object> invoiceValues = invoiceRepository.getInvoiceSettings();

			// Calculate tax in rupee

			Object invTaxRateValue = invoiceValues.get("invoiceTaxRate");
			Long invoiceTaxRate = invTaxRateValue != null ? ((Number) invTaxRateValue).longValue() : null;

			invoice.setInvoiceTaxRate(invoiceTaxRate); // set current GST rate

			Object invDiscountvalue = invoiceValues.get("invoiceDiscount");
			Long invoiceDiscount = invDiscountvalue != null ? ((Number) invDiscountvalue).longValue() : null;

			invoice.setInvoiceDiscount(invoiceDiscount); // set current discount

			// Long invoiceTaxRate = invoiceValues.get("invoice_tax_rate"); // 18% -> 0.18 
	        // Long taxAmount = Math.round(totalAmount * invoiceTaxRate / (1 + invoiceTaxRate));	

			double taxRateAmount = totalAmount * invoiceTaxRate / 100.0; //	50 * 18/100	= 9
			Long taxAmount = Math.round(taxRateAmount);
			invoice.setTaxAmount(taxAmount);

			// InvoiceId set
			String prefix = (String) invoiceValues.get("invoice_prefix"); // ABC
			String year = (String) invoiceValues.get("invoice_year"); // 25-26
			String suffix = (String) invoiceValues.get("invoice_suffix"); // 123

			// === exsisting working code == //
			
			// String generateInvoiceId = "";
			// Invoice lastInvoice = invoiceRepository.findTopByOrderByInvoiceDateDescIdDesc().orElse(null);


			// 	InvoiceSettings settings = invoiceSettingsRepository.findTopByOrderByIdDesc();

    		// 	Boolean updateSerialNo = settings != null && Boolean.TRUE.equals(settings.getUpdateSerialNo());


			// if (lastInvoice == null || updateSerialNo) {

			// 	generateInvoiceId = prefix + "/" + year + "/" + suffix;

			// 	// 🔥 IMPORTANT → reset flag after use
			// 	if (settings != null && Boolean.TRUE.equals(settings.getUpdateSerialNo())) {
			// 		settings.setUpdateSerialNo(false);
			// 		invoiceSettingsRepository.save(settings);
			// 	}

			// } else {
			// 	// your existing increment logic
			// // }

			// // if (lastInvoice == null) {
			// // 	// ✅ First invoice → use admin-defined suffix
			// // 	generateInvoiceId  = prefix + "/" + year + "/" + suffix; // ABC/25-26/123
			// // } else {
			// 	// ✅ Get last invoiceId						
			// 	String lastInvoiceId = lastInvoice.getInvoiceId();

			// 	String prefixPart;
			// 	String suffixPart;

			// 	// ✅ Handle BOTH formats (old + new)
			// 	if (lastInvoiceId.contains("/")) {

			// 		String[] parts = lastInvoiceId.split("/");

			// 		if (parts.length < 3) {
			// 			throw new RuntimeException("Invalid invoice format: " + lastInvoiceId);
			// 		}

			// 		prefixPart = parts[0];   // ABC
			// 		suffixPart = parts[2];   // 00123

			// 	} else {

			// 		// Old format (RNK126, TEST00045)
			// 		prefixPart = lastInvoiceId.replaceAll("[0-9]", "");   // RNK
			// 		suffixPart = lastInvoiceId.replaceAll("[^0-9]", "");  // 00045
			// 	}

			// 	// 🔥 Safety check
			// 	if (suffixPart == null || suffixPart.isEmpty()) {
			// 		throw new RuntimeException("Invalid invoice suffix: " + lastInvoiceId);
			// 	}

			// 	// 🔹 Increment suffix
			// 	int length = suffixPart.length();
			// 	int nextNumber = Integer.parseInt(suffixPart) + 1;

			// 	String newSuffix = String.format("%0" + length + "d", nextNumber);

			// 	// 🔹 Build final invoice ID
			// 	generateInvoiceId = prefix + "/" + year + "/" + newSuffix;

			// }

			// invoice.setInvoiceId(generateInvoiceId);
			// return invoiceRepository.save(invoice);

			// == above exsisting working code == //

			// ✅ Get last invoiceId						
			// String lastInvoiceId = lastInvoice.getInvoiceId();
			InvoiceSettings settings = invoiceSettingsRepository.findTopByOrderByIdDesc();
			Invoice lastInvoice = invoiceRepository.findTopByOrderByInvoiceDateDescIdDesc().orElse(null);
			Boolean updateSerialNo = settings.getUpdateSerialNo();
			

			String generateInvoiceId = "";

			String lastInvoiceId = lastInvoice != null ? lastInvoice.getInvoiceId() : null;

			if (updateSerialNo) {
				// 🔥 RESET CASE
				generateInvoiceId = prefix + "/" + year + "/" + suffix;

				// reset flag after use
				settings.setUpdateSerialNo(false);
				invoiceSettingsRepository.save(settings);

			} else if (lastInvoiceId == null) {
				// 🆕 FIRST INVOICE
				generateInvoiceId = prefix + "/" + year + "/" + suffix;

			} else {
				// 🔁 CONTINUE SERIES

				String prefixPart;
				String suffixPart;

				if (lastInvoiceId.contains("/")) {
					String[] parts = lastInvoiceId.split("/");

					prefixPart = parts[0];
					suffixPart = parts[2];

				} else {
					// old format
					prefixPart = lastInvoiceId.replaceAll("[0-9]", "");
					suffixPart = lastInvoiceId.replaceAll("[^0-9]", "");
				}

				if (suffixPart == null || suffixPart.isEmpty()) {
					throw new RuntimeException("Invalid invoice suffix: " + lastInvoiceId);
				}

				int length = suffixPart.length();
				int nextNumber = Integer.parseInt(suffixPart) + 1;

				String newSuffix = String.format("%0" + length + "d", nextNumber);

				generateInvoiceId = prefix + "/" + year + "/" + newSuffix;
			}

			invoice.setInvoiceId(generateInvoiceId);
			 return invoiceRepository.save(invoice);

	    }

	@Override
	public List<Invoice> getInvoiceByUserId(Long userId){
		List<Invoice> invoice = invoiceRepository.findByUsersIdOrderByInvoiceDateDescIdDesc(userId);
		return invoice;
	 }

}
