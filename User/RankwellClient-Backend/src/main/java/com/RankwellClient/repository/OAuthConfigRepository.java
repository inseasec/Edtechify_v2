package com.RankwellClient.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.RankwellClient.entity.OAuthConfig;

public interface OAuthConfigRepository extends JpaRepository<OAuthConfig, Long> {}

