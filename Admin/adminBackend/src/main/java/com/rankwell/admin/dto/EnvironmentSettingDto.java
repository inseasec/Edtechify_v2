package com.rankwell.admin.dto;

public class EnvironmentSettingDto {

    private Long id;
    private String serverIp;
    private String serverFolderName;
    private Boolean active;

    public EnvironmentSettingDto() {
    }

    public EnvironmentSettingDto(String serverIp, String serverFolderName) {
        this.serverIp = serverIp;
        this.serverFolderName = serverFolderName;
    }

    public EnvironmentSettingDto(Long id, String serverIp, String serverFolderName, Boolean active) {
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
    
}
