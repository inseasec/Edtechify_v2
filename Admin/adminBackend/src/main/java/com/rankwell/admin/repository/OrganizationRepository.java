package com.rankwell.admin.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rankwell.admin.entity.OrganizationDetail;

public interface OrganizationRepository extends JpaRepository<OrganizationDetail, Long> {

	Optional<OrganizationDetail> findFirstByOrderByIdAsc(); 

}
