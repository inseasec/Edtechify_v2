package com.RankwellClient.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import com.RankwellClient.entity.ApplyFor;

@Repository
public interface ApplyForRepository extends JpaRepository<ApplyFor,Long>{  
        
       
}