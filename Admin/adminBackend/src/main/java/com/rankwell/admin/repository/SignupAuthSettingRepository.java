package com.rankwell.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rankwell.admin.entity.SignupAuthSetting;

public interface SignupAuthSettingRepository extends JpaRepository<SignupAuthSetting, Long> {}

