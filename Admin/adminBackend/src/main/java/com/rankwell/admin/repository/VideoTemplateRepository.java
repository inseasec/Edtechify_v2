package com.rankwell.admin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

//import com.rankwell.admin.entity.Courses;
import com.rankwell.admin.entity.OrgHome;
import java.util.Optional;
import com.rankwell.admin.entity.HomeVideo;
import org.springframework.data.jpa.repository.Query;


@Repository
public interface VideoTemplateRepository extends JpaRepository<HomeVideo, Long>{ 
      
    @Query("SELECT COALESCE(MAX(v.serialNumber), 0) FROM HomeVideo v")
    Integer findMaxSerialNumber();
 
} 