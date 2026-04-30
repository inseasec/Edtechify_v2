package com.rankwell.admin.dto;

import com.rankwell.admin.entity.ApplyFor;
import java.time.LocalDate;


  public class CareerRequestDto {

    // Personal info
    private String fullName;
    private String email;
    private String phone;
    private String city;
    private String gender;
    // private Integer age;
    private LocalDate dob;
    private String state;
    private String maritalStatus; 
 
    // Professional info
    private String qualification;
    private String experienceLevel;
    private String currentSalary;
    private String expectedSalary; 

    // Teaching info
    private String subjects;
     
    private ApplyFor applyingFor;

    //  private String status;


    //GETTERS & SETTERS 

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
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

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getGender() { 
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getMaritalStatus() {
        return maritalStatus;
     }

    public void setMaritalStatus(String maritalStatus) {
        this.maritalStatus = maritalStatus;
    }
 
    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }


    public LocalDate getDob() {
        return dob;
     }

    public void setDob(LocalDate dob) {
      this.dob = dob;
     }

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

    public String getSubjects() {
        return subjects;
    }

    public void setSubjects(String subjects) {
        this.subjects = subjects;
    }

    public ApplyFor getApplyingFor() {
    return applyingFor;
    }

    public void setApplyingFor(ApplyFor applyingFor) {
    this.applyingFor = applyingFor;
    }

//     public String getStatus() {
//     return status;
//     }

//   public void setStatus(String status) {
//     this.status = status;
//     }

}
