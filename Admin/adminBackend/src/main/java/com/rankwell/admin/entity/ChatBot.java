package com.rankwell.admin.entity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "chatbot_settings")
public class ChatBot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  
    private Long id;

    @Column(name = "mobile_no", nullable = false)
    private String mobileNo; 

    @Column(name = "is_whatsapp_enabled")
    private Boolean whatsappEnabled;

    @Column(name = "is_talk_to_enabled") 
    private Boolean talkToEnabled;

    @Column(name = "talkToKey")
    private String talkToKey;

    @Column(name = "email")
    private String email;

    @Column(name = "password")
    private String password;

    //  Constructors 
    public ChatBot() {}

    public ChatBot(String mobileNo, Boolean whatsappEnabled, Boolean talkToEnabled, String email, String password) {
        this.mobileNo = mobileNo;
        this.whatsappEnabled = whatsappEnabled;
        this.talkToEnabled = talkToEnabled;
        this.email = email;
        this.password = password;
    }

    //  Getters & Setters

     public String getTalkToKey() {
      return talkToKey;
    }

     public void setTalkToKey(String talkToKey) {
        this.talkToKey = talkToKey;
     }


    public Long getId() {
            return id;
        }

    public String getMobileNo() {
        return mobileNo;
    }

    public void setMobileNo(String mobileNo) {
        this.mobileNo = mobileNo;
    }

    public Boolean getWhatsappEnabled() {
        return whatsappEnabled;
    }

    public void setWhatsappEnabled(Boolean whatsappEnabled) {
        this.whatsappEnabled = whatsappEnabled;
    }

    public Boolean getTalkToEnabled() {
        return talkToEnabled;
    }

    public void setTalkToEnabled(Boolean talkToEnabled) {
        this.talkToEnabled = talkToEnabled;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}