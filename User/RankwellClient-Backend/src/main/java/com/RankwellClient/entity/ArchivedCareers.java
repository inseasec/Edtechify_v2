package com.RankwellClient.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.CascadeType;
import jakarta.persistence.JoinColumn;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import jakarta.persistence.PrePersist;
import java.time.LocalDateTime;



@Entity
@Table(name = "Archived_Careers")
public class ArchivedCareers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Personal info
    private String fullName;
    private String email;
    private String phone;
    private String state;
    private String city;
    private String gender;
    private String maritalStatus;
    private LocalDate dob;

    // Professional info
    private String qualification;
    private String experienceLevel;
    private String currentSalary;
    private String expectedSalary;

    // Teaching info 
    private String subjects;

    // Archived resume path
    private String resume;

    private String video;
    private String status;

    private LocalDateTime applicationDate;
    private LocalDateTime archivedDate;

    private String applyingFor;   

    @PrePersist
    protected void onArchive() {
        this.archivedDate = LocalDateTime.now();
    }

   // GETTERS & SETTERS

    public Long getId() {
       return id;
      }

    public void setId(Long id) {
       this.id = id;
     }

  // Personal info
    public String getFullName(){
      return fullName;
    }

    public void setFullName(String fullName){
      this.fullName = fullName;
   }

    public String getEmail() {
      return email;
    }

    public void setEmail(String email) {
      this.email = email;
     }

    public String getPhone() {
      return phone;
    }

    public void setPhone(String phone) {
     this.phone = phone;
    }

    public String getState() {
      return state;
    }

    public void setState(String state) {
      this.state = state;
   }

    public String getCity() {
      return city;
   }

   public void setCity(String city) {
      this.city = city;
   }

   public String getGender() {
    return gender;
   }

   public void setGender(String gender){
    this.gender = gender;
  }

  public String getMaritalStatus() {
    return maritalStatus;
  }

  public void setMaritalStatus(String maritalStatus) {
    this.maritalStatus = maritalStatus;
 }

public LocalDate getDob() {
    return dob;
}

public void setDob(LocalDate dob) {
    this.dob = dob;
}

// Professional info
public String getQualification() {
    return qualification;
}

public void setQualification(String qualification) {
    this.qualification = qualification;
}

public String getExperienceLevel() {
    return experienceLevel;
}

public void setExperienceLevel(String experienceLevel) {
    this.experienceLevel = experienceLevel;
}

public String getCurrentSalary() {
    return currentSalary;
}

public void setCurrentSalary(String currentSalary) {
    this.currentSalary = currentSalary;
}

public String getExpectedSalary() {
    return expectedSalary;
}

public void setExpectedSalary(String expectedSalary) {
    this.expectedSalary = expectedSalary;
}

// Teaching info
public String getSubjects() {
    return subjects;
}

public void setSubjects(String subjects) {
    this.subjects = subjects;
}

// Resume / media
public String getResume() {
    return resume;
}

public void setResume(String resume) {
    this.resume = resume;
}

public String getVideo() {
    return video;
}

public void setVideo(String video) {
    this.video = video;
}

// Status & dates
public String getStatus() {
    return status;
}

public void setStatus(String status) {
    this.status = status;
}

public LocalDateTime getApplicationDate() {
    return applicationDate;
}

public void setApplicationDate(LocalDateTime applicationDate){
    this.applicationDate = applicationDate;
}

public LocalDateTime getArchivedDate() {
    return archivedDate;
}

public void setArchivedDate(LocalDateTime archivedDate){
    this.archivedDate = archivedDate;
}

// Snapshot fields (NO FK)
public String getApplyingFor(){
    return applyingFor;
}

public void setApplyingFor(String applyingFor){
    this.applyingFor = applyingFor;
}

}
