package com.rankwell.admin.services;

import  com.rankwell.admin.entity.ChatBot;

public interface ChatbotService {

    ChatBot saveOrUpdate(ChatBot chatbot);

    ChatBot getSettings(); 
}