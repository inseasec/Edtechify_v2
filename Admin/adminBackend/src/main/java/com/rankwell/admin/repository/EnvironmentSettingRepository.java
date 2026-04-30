package com.rankwell.admin.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.rankwell.admin.entity.EnvironmentSetting;


public interface EnvironmentSettingRepository extends JpaRepository<EnvironmentSetting, Long> {

    Optional<EnvironmentSetting> findTopByOrderByIdAsc();

    @Modifying
    @Query("UPDATE EnvironmentSetting e SET e.active = false")
    void deactivateAll();

    public Optional<EnvironmentSetting> findByActiveTrue();

    
}