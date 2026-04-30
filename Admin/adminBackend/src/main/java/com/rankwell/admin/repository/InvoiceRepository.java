package com.rankwell.admin.repository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.rankwell.admin.entity.Invoice;
import java.util.List;
import org.springframework.data.repository.query.Param;

public interface InvoiceRepository extends JpaRepository<Invoice, Long>{

    List<Invoice> findAllByOrderByInvoiceDateDescIdDesc();

    // @Query("SELECT DISTINCT i FROM Invoice i LEFT JOIN FETCH i.courses ORDER BY i.invoiceDate DESC")
    // List<Invoice> findAllWithCourses();

    // @EntityGraph(attributePaths = {"courses", "courses.departements"})
    // List<Invoice> findAllByOrderByInvoiceDateDescIdDesc();

//    @Query("SELECT COUNT(c) FROM Invoice i JOIN i.courses c WHERE c.id = :courseId")
//	Long countByCourseId(@Param("courseId") Long courseId);  /// ajay

    // @Query("SELECT i FROM Invoice i JOIN FETCH i.courses ORDER BY i.invoiceDate DESC")
    // List<Invoice> findAllWithCourses();

    // @Query("SELECT DISTINCT i FROM Invoice i LEFT JOIN FETCH i.courses ORDER BY i.invoiceDate DESC")
    // List<Invoice> findAllWithCourses();
    

}