package com.rankwell.admin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository; 
import org.springframework.stereotype.Repository;

import com.rankwell.admin.entity.ChatBot;
import java.util.Optional;

public interface ChatbotRepository extends JpaRepository<ChatBot, Long> {   
}