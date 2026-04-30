package com.rankwell.admin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

//import com.rankwell.admin.entity.Courses;
import com.rankwell.admin.entity.OrgAboutUs;
import java.util.Optional;

@Repository
public interface AboutusRepository extends JpaRepository<OrgAboutUs,Long>{
    Optional<OrgAboutUs> findFirstByOrderByIdAsc();
}