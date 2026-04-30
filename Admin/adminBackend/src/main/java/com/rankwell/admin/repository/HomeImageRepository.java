package com.rankwell.admin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

//import com.rankwell.admin.entity.Courses;
import com.rankwell.admin.entity.HomeImage;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface HomeImageRepository extends JpaRepository<HomeImage, Long>{
    // Optional<OrgHome> findFirstByOrderByIdAsc();

    // @Query("SELECT COALESCE(MAX(h.serialNumber), 0) FROM HomeImage h")
    // Integer findMaxSerialNumber();
    HomeImage findTopByOrderBySerialNumberDesc();
}