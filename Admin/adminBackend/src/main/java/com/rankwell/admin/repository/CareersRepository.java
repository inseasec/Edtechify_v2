package com.rankwell.admin.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import com.rankwell.admin.entity.Careers;
import java.util.List;
import org.springframework.data.jpa.repository.Query;


@Repository
public interface CareersRepository extends JpaRepository<Careers,Long> {

   
     Optional<Careers> findByEmail(String email);

//      List<Careers> findByStatus(String status);
     List<Careers> findByStatusOrderByIdDesc(String status); 

     List<Careers> findByHrId(Long hrId);

     List<Careers> findByHrIdAndStatus(Long hrId,String status);

      List<Careers> findAllByOrderByIdDesc();

      @Query("SELECT c FROM Careers c WHERE c.hrId IS NOT NULL")
      List<Careers> findCareersWithAssignedHr();



}
