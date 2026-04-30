package com.rankwell.admin.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.rankwell.admin.entity.Admins;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admins,Long>{
	 Optional<Admins> findByEmail(String email);
	 boolean existsByRole(Admins.Role role);
	 
//	 @Query("SELECT a FROM Admins a JOIN FETCH a.departments")
//	 List<Admins> findAllWithDepartments();
	 
//	 @EntityGraph(attributePaths = {"departments"})
//	 List<Admins> findAll();
//	 
	 Optional<Admins> findByRole(Admins.Role role);
}
