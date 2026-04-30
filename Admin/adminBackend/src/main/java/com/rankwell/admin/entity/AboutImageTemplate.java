package com.rankwell.admin.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;

@Entity
public class AboutImageTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    
    private String imagePath;

    @ManyToOne
    @JoinColumn(name = "about_us_id")
    private OrgAboutUs aboutUs;

    @Column(name = "serial_number") 
    private Integer serialNumber;


                                            
    // =====================
    // Getters and Setters
    // =====================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(Integer serialNumber) {
        this.serialNumber = serialNumber;
    }




    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public OrgAboutUs getAboutUs() {
        return aboutUs;
    }

    public void setAboutUs(OrgAboutUs aboutUs) {
        this.aboutUs = aboutUs;
    }
}