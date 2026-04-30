package com.rankwell.admin.serviceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rankwell.admin.entity.ChatBot;
import com.rankwell.admin.repository.ChatbotRepository;
import com.rankwell.admin.services.ChatbotService;


@Service
public class ChatbotServiceImpl implements ChatbotService {

    @Autowired
    private ChatbotRepository repository;
    

    @Override
    public ChatBot saveOrUpdate(ChatBot chatbot) {

        //  Only ONE row logic (important)
        if (repository.count() > 0) {
            ChatBot existing = repository.findAll().get(0);

            existing.setMobileNo(chatbot.getMobileNo());
            existing.setWhatsappEnabled(chatbot.getWhatsappEnabled()); 
            existing.setTalkToEnabled(chatbot.getTalkToEnabled());
            existing.setTalkToKey(chatbot.getTalkToKey());
            existing.setEmail(chatbot.getEmail());
            existing.setPassword(chatbot.getPassword());

            return repository.save(existing);
        }

        return repository.save(chatbot);
    }

    @Override
    public ChatBot getSettings() {
        return repository.findAll()
                .stream()
                .findFirst()
                .orElse(null);
     }
}