package com.RankwellClient.repository;

import com.RankwellClient.entity.Careers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional; 

@Repository
public interface CareersRepository extends JpaRepository<Careers, Long>{

    @Query("SELECT c FROM Careers c " + "WHERE c.applyFor.id = :applyForId " + "AND (c.email = :email OR c.phone = :phone)")
    Optional<Careers> findDuplicate(
            @Param("applyForId") Long applyForId,
            @Param("email") String email,
            @Param("phone") String phone); 

    Optional<Careers> findFirstByEmailIgnoreCase(String email);

    @Query("SELECT c FROM Careers c WHERE c.phone = :phone OR c.phone LIKE %:last10")
    Optional<Careers> findFirstByPhoneEqualsOrPhoneEndsWith(@Param("phone") String phone, @Param("last10") String last10);
}
