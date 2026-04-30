package com.RankwellClient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.RankwellClient.entity.InvoiceSettings;

@Repository
public interface InvoiceSettingsRepository extends JpaRepository<InvoiceSettings, Long>{

    InvoiceSettings findTopByOrderByIdDesc();
	
}