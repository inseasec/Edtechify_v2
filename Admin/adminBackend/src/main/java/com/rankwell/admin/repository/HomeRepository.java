package com.rankwell.admin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

//import com.rankwell.admin.entity.Courses;
import com.rankwell.admin.entity.OrgHome;
import java.util.Optional;

@Repository
public interface HomeRepository extends JpaRepository<OrgHome, Long>{
    Optional<OrgHome> findFirstByOrderByIdAsc();

    
}