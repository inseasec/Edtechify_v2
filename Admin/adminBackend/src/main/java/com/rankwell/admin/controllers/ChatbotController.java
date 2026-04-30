package com.rankwell.admin.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.rankwell.admin.services.ChatbotService;
import com.rankwell.admin.entity.ChatBot;



@RestController
@RequestMapping("/api/chatbot")   
// @CrossOrigin
public class ChatbotController {

    @Autowired
    private ChatbotService service;

    //  Save & Update  RsponseBody
    @PostMapping("/save") 
    public ResponseEntity<ChatBot> save(@RequestBody ChatBot chatbot) { 
        return ResponseEntity.ok(service.saveOrUpdate(chatbot));
    }

    @GetMapping("/get")
    public ResponseEntity<ChatBot> get() {
        return ResponseEntity.ok(service.getSettings()); 
    }  

}