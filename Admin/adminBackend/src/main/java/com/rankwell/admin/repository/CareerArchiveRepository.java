package com.rankwell.admin.repository;

import com.rankwell.admin.entity.ArchivedCareers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; 
import java.util.List;



@Repository
public interface CareerArchiveRepository extends JpaRepository<ArchivedCareers, Long> { 
    // List<ArchivedCareers> findAllByOrderByIdDesc();
     
}
