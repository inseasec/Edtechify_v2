package com.rankwell.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rankwell.admin.entity.OAuthConfig;

public interface OAuthConfigRepository extends JpaRepository<OAuthConfig, Long> {}

