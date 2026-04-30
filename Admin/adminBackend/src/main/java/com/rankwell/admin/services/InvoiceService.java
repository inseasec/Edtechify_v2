package com.rankwell.admin.services;
import com.rankwell.admin.dto.InvoiceDto;
import java.util.List;
import com.rankwell.admin.entity.Invoice;

public interface InvoiceService {

    List<Invoice> getAllInvoices(String loggedInAdminEmai);

    // List<InvoiceDto> getAllInvoices(String loggedInAdminEmai);

    Long getCoursePurchaseCount(Long courseId); // get course purchased count

}