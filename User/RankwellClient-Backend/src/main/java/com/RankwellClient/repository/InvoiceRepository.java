package com.RankwellClient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.RankwellClient.entity.Invoice;
import java.util.Map;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long>{
    
    @Query(value = "SELECT * FROM invoice_settings ORDER BY id ASC LIMIT 1", nativeQuery = true)
    Map<String, Object> getInvoiceSettings();

    // List<Invoice> findByUsersId(Long userId);

    List<Invoice> findByUsersIdOrderByInvoiceDateDescIdDesc(Long userId);

    Optional<Invoice> findTopByOrderByInvoiceDateDescIdDesc();

}
