package com.rankwell.admin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

//import com.rankwell.admin.entity.Courses;
import com.rankwell.admin.entity.OrgHome;
import java.util.Optional;
import com.rankwell.admin.entity.AboutImageTemplate;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface AboutImageRepository extends JpaRepository<AboutImageTemplate, Long>{

    @Query("SELECT COALESCE(MAX(a.serialNumber), 0) FROM AboutImageTemplate a")
    Integer findMaxSerialNumber();
 
}