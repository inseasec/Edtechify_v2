package com.rankwell.admin.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.rankwell.admin.entity.ApplyFor;

@Repository
public interface ApplyForRepository extends JpaRepository<ApplyFor,Long>{
        
       
}