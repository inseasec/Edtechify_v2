package com.rankwell.admin.entity;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Column;
 
@Entity
public class HomeVideo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;

    private String videoPath; 

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "home_id")
    private OrgHome home;

    @Column(name = "serial_number")
    private Integer serialNumber;



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

public String getVideoPath() {
    return videoPath;
}

public void setVideoPath(String videoPath) {
    this.videoPath = videoPath;
}

public OrgHome getHome() {
    return home;
}

public void setHome(OrgHome home) {
    this.home = home;
}
}