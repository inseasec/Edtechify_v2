package com.RankwellClient.dto;

import jakarta.persistence.Column;


public class ApplyForDto{  

    private String applyingFor;

    @Column(length = 2000)
    private String description;
   
   private RoleType roleType; 

    //getter setter //

 public String getApplyingFor() {
        return applyingFor;
    }

    public void setApplyingFor(String applyingFor) {
        this.applyingFor = applyingFor;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public RoleType getRoleType() {
           return roleType;
        }

    public void setRoleType(RoleType roleType) {
        this.roleType = roleType;
    }
    
}