
package com.RankwellClient.repository;

import com.RankwellClient.entity.ArchivedCareers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CareerArchiveRepository extends JpaRepository<ArchivedCareers, Long> {

    // Returns true if a record exists with the given email and phone
           boolean existsByEmailAndPhone(String email, String phone);

           Optional<ArchivedCareers> findByEmailAndPhone(String email, String phone); 
}
