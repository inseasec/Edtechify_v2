package com.RankwellClient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.RankwellClient.entity.SignupAuthSetting;

@Repository
public interface SignupAuthSettingRepository extends JpaRepository<SignupAuthSetting, Long> {
}

