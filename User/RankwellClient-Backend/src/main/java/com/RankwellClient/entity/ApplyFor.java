package com.RankwellClient.entity;

import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import com.RankwellClient.dto.RoleType;
import java.util.List;

@Entity
@Table(name="ApplyFor") 
public class ApplyFor{ 
   
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;
    
    @OneToMany(mappedBy="applyFor") 
    private List<Careers> applicant;

    private String applyingFor;      // Job position
        
    @Column(length = 2000)
    private String description;      // Job description or notes

    @Enumerated(EnumType.STRING)
     private RoleType roleType;       // Type of Role


    //getter setter //


      public Long getId(){
        return id;
      }
      
      public void setId(Long id){
        this.id=id;
      }

      public String getApplyingFor(){ 
         return applyingFor; 
        }

      public void setApplyingFor(String applyingFor){ 
        this.applyingFor = applyingFor; 
        }

      public String getDescription(){
         return description; 
        }

      public void setDescription(String description){ 
        this.description = description; 
        }

        public RoleType getRoleType() {
           return roleType;
        }

      public void setRoleType(RoleType roleType){
           this.roleType = roleType;
        }


}