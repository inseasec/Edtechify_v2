package com.rankwell.admin.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.rankwell.admin.entity.InvoiceSettings;

@Repository
public interface InvoiceSettingsRepository extends JpaRepository<InvoiceSettings, Long>{

     Optional<InvoiceSettings> findTopByOrderByIdAsc();
	
}