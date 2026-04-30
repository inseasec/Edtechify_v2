package com.rankwell.admin.serviceImpl;

import org.hibernate.Hibernate;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import com.rankwell.admin.entity.Invoice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.rankwell.admin.services.InvoiceService;
import com.rankwell.admin.repository.InvoiceRepository;
import com.rankwell.admin.repository.AdminRepository;
import com.rankwell.admin.entity.Admins;
import com.rankwell.admin.dto.InvoiceDto;
import java.util.Set;
import java.util.*;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class InvoiceServiceImpl implements InvoiceService{

    @Autowired
	private InvoiceRepository invoiceRepository;

    @Autowired
	private AdminRepository adminRepository;

//    @Autowired
//    private CourseRepository courseRepository;

    @Override
	public List<Invoice> getAllInvoices(String loggedInAdminEmail){

         Admins admin = adminRepository.findByEmail(loggedInAdminEmail).orElseThrow(() 
				-> new RuntimeException("Admin Not Found"));

		List<Invoice> invoice = invoiceRepository.findAllByOrderByInvoiceDateDescIdDesc(); 
        
		return invoice;
	 }

	@Override
    public Long getCoursePurchaseCount(Long courseId) {

//        if (courseId == null) {
//            throw new RuntimeException("CourseId cannot be null");
//        }
//        Long count = invoiceRepository.countByCourseId(courseId);
//        return count != null ? count : 0L;
		return 0L;
    }

    
    // @Override
    // public List<InvoiceDto> getAllInvoices(String loggedInAdminEmail) {

    //     List<Invoice> invoices = invoiceRepository.findAllByOrderByInvoiceDateDescIdDesc();

    //     return invoices.stream().map(invoice -> {

    //         InvoiceDto dto = new InvoiceDto();

    //         // 🔹 Basic fields
    //         dto.setId(invoice.getId());
    //         dto.setInvoiceId(invoice.getInvoiceId());
    //         dto.setInvoiceNumber(invoice.getInvoiceNumber());
    //         dto.setInvoiceDate(invoice.getInvoiceDate());
    //         dto.setTotalAmount(invoice.getTotalAmount());
    //         dto.setTaxAmount(invoice.getTaxAmount());
    //         dto.setBillingAddress(invoice.getBillingAddress());
    //         dto.setInvoiceDiscount(invoice.getInvoiceDiscount());
    //         dto.setInvoiceTaxRate(invoice.getInvoiceTaxRate());

    //         // 🔹 User & Payment
    //         dto.setUser(invoice.getUsers());
    //         dto.setPayment(invoice.getPayment());


    //         // 🔥 FINAL FIX — Courses Mapping
    //     if (invoice.getCourses() != null && !invoice.getCourses().isEmpty()) {

    //         List<Object> courseList = invoice.getCourses()
    //                 .stream()
    //                 .map(course -> {
    //                     Map<String, Object> map = new HashMap<>();
    //                     map.put("id", course.getId());
    //                     map.put("courseName", course.getCourseName());
    //                     map.put("price", course.getPrice());
    //                     return map;
    //                 })
    //                 .toList();

    //         dto.setCourses(courseList);
    //     }

    //         // // 🔥 FINAL FIX — Courses Mapping
    //         // if (invoice.getCourses() != null && !invoice.getCourses().isEmpty()) {

    //         //     List<Object> courseList = invoice.getCourses()
    //         //             .stream()
    //         //             .map(course -> {
    //         //                 Map<String, Object> map = new HashMap<>();
    //         //                 map.put("id", course.getId());
    //         //                 map.put("courseName", course.getCourseName());
    //         //                 map.put("price", course.getPrice());
    //         //                 return map;
    //         //             })
    //         //             .toList();

    //         //     dto.setCourses(courseList);
    //         // }

    //         return dto;

    //     }).toList();
    // }
}