package com.rankwell.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "environment_setting")
public class EnvironmentSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "server_ip", nullable = false)
    private String serverIp;

    @Column(name = "server_folder_name", nullable = false)
    private String serverFolderName;

    @Column(nullable = false)
    private Boolean active = false;


    public EnvironmentSetting() {
    }

    public EnvironmentSetting(String serverIp, String serverFolderName, boolean active) {
        this.serverIp = serverIp;
        this.serverFolderName = serverFolderName;
        this.active = active;
    }

    public EnvironmentSetting(Long id, String serverIp, String serverFolderName, boolean active) {
        this.id = id;
        this.serverIp = serverIp;
        this.serverFolderName = serverFolderName;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getServerIp() {
        return serverIp;
    }

    public void setServerIp(String serverIp) {
        this.serverIp = serverIp;
    }

    public String getServerFolderName() {
        return serverFolderName;
    }

    public void setServerFolderName(String serverFolderName) {
        this.serverFolderName = serverFolderName;
    }

    public boolean getActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
    
}
