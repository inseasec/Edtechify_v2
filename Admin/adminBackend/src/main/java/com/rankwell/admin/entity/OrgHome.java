package com.rankwell.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.List;
import com.rankwell.admin.entity.OrganizationDetail;
import jakarta.persistence.OneToOne;
import jakarta.persistence.JoinColumn;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import java.util.ArrayList;
import com.rankwell.admin.entity.HomeVideo;
import com.fasterxml.jackson.annotation.JsonManagedReference; 
import com.rankwell.admin.entity.HomeImage;
import jakarta.validation.constraints.Size;



@Entity
@Table(name = "home_page")
public class OrgHome{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;

//    @OneToMany(mappedBy = "home", cascade = CascadeType.ALL, orphanRemoval = true) 
//    private List<OrgCourse> courses = new ArrayList<>();

    @OneToMany(mappedBy = "home", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<HomeVideo> videos = new ArrayList<>();

    @OneToMany(mappedBy = "home", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<HomeImage> images;
    private String bannerVideo; 
    

   @OneToOne
	 @JoinColumn(name = "organization_id", nullable = false) 
	 @JsonBackReference
    private OrganizationDetail organization;  

    public enum HeadingType {
        NOTES,
        COMPREHENSIVE,
        VIDEO,
        COMPLETE,
        TRENDING_COURSE,
    }

   private String departmentType;
   private String NotesDepartmentType;

    private Boolean allCourses; 
    private Boolean noteCourse;
    private Boolean completeCourse;
    private Boolean videoCourse;

    private String notesHeading;
    private String comphrensiveHeading;
    private String videoHeading;
    private String completeHeading;
    private String trendingCourseHeading;

    @Size(max = 50000)
    private String termsAndConditions;

    public String getTermsAndConditions() {
      return termsAndConditions;
    }

    public void setTermsAndConditions(String termsAndConditions) {
      this.termsAndConditions = termsAndConditions;
   }





     public String getDepartmentType() {
      return departmentType;
     }

      public void setDepartmentType(String departmentType) {
        this.departmentType = departmentType;
     }
     
     public String getNotesDepartmentType() {
       return NotesDepartmentType;
     }

    public void setNotesDepartmentType(String notesDepartmentType) {
      NotesDepartmentType = notesDepartmentType;
    }



    
    public String getNotesHeading() {
        return notesHeading;
    }

    public void setNotesHeading(String notesHeading) {
        this.notesHeading = notesHeading;
    }

    public String getComphrensiveHeading() {
        return comphrensiveHeading;
    }

    public void setComphrensiveHeading(String comphrensiveHeading) {
        this.comphrensiveHeading = comphrensiveHeading;
    }

    public String getVideoHeading() {
        return videoHeading;
    }

    public void setVideoHeading(String videoHeading) {
        this.videoHeading = videoHeading;
    }

    public String getCompleteHeading() {
        return completeHeading;
    }

    public void setCompleteHeading(String completeHeading) {
        this.completeHeading = completeHeading;
    }

    public String getTrendingCourseHeading() {
        return trendingCourseHeading;
    }

    public void setTrendingCourseHeading(String trendingCourseHeading) {
        this.trendingCourseHeading = trendingCourseHeading;
    }

   
   //GETTERS & SETTERS//

    public List<HomeVideo> getVideos() {
       return videos;
     }

    public void setVideos(List<HomeVideo> videos) {
     this.videos = videos;
    }

    public Boolean getAllCourses() {
      return allCourses;
     }

    public void setAllCourses(Boolean allCourses) {
      this.allCourses = allCourses;
    }

    public Boolean getNoteCourse() {
      return noteCourse;
    }

    public void setNoteCourse(Boolean noteCourse) {
     this.noteCourse = noteCourse;
    }

  public Boolean getCompleteCourse() {
    return completeCourse;
  }

  public void setCompleteCourse(Boolean completeCourse) {
    this.completeCourse = completeCourse;
  }

  public Boolean getVideoCourse() {
    return videoCourse;
  }

  public void setVideoCourse(Boolean videoCourse) {
    this.videoCourse = videoCourse;
  }

    public String getBannerVideo() {
       return bannerVideo;
     }

     public void setBannerVideo(String bannerVideo) {
         this.bannerVideo = bannerVideo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<HomeImage> getImages(){
      return images;
    }

    public void setImages(List<HomeImage> images){
       this.images = images;
     }

//    public List<OrgCourse> getCourses() { return courses; }
//    public void setCourses(List<OrgCourse> courses) { this.courses = courses; }

    // public String getLogoPath() {
    //     return logoPath;
    // }

    // public void setLogoPath(String logoPath) {
    //     this.logoPath = logoPath;
    // }

//    public List<String>getCourseVideo(){
//       return courseVideo;
//     }

//    public void setCourseVideo(List<String> courseVideo){
//       this.courseVideo = courseVideo;
//    }
   
  

    // public String getTitle() {
    //     return title;
    // }

    // public void setTitle(String title) {
    //     this.title = title;
    // }

    // public String getDescription() {
    //     return description;
    // }

    // public void setDescription(String description) {
    //     this.description = description;
    // }

    public OrganizationDetail getOrganization() {
    return organization;
    }

   public void setOrganization(OrganizationDetail organization) {
    this.organization = organization;
    }

}

