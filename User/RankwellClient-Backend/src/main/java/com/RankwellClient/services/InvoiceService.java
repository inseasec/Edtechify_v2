package com.RankwellClient.services;

import java.util.List;
import com.RankwellClient.entity.Invoice;
import com.RankwellClient.entity.Payment;

public interface InvoiceService {

	Invoice generateInvoice(Payment payment);

	List<Invoice> getInvoiceByUserId(Long userId);

}
