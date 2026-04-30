package com.rankwell.admin.dto;

import com.rankwell.admin.entity.OrgGallery;
import com.rankwell.admin.entity.OrgHome;
import java.util.Map;

public class OrganizationDetailDto {

	private Long id;
	
	private String orgName;
	private String orgAddress;
	private String orgPhone;
	private String orgEmail; 
	private String orgLogo;
	// private String title;
	// private  String description;
	
	private OrgAboutUsDTO orgAboutUs;
	private OrgDirectorDetailDTO orgDirectorDetail;
	private OrgAchievementDTO orgAchievement; 
	private OrgGallery orgGallery;
	private OrgHome orgHome;



  public OrgHome getOrgHome() {
    return orgHome;
   }

  public void setOrgHome(OrgHome orgHome) {
    this.orgHome = orgHome;
   }


// 	public String getTitle() {
//     return title;
//    }

//     public void setTitle(String title) {
//      this.title = title;
//    }

// // Getter and Setter for description
// public  String getDescription() {
//     return description;
//   }

// public void setDescription( String description) {
//     this.description = description;
// }     
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getOrgName() {
		return orgName;
	}
	public void setOrgName(String orgName) {
		this.orgName = orgName;
	}
	public String getOrgAddress() {
		return orgAddress;
	}
	public void setOrgAddress(String orgAddress) {
		this.orgAddress = orgAddress;
	}
	public String getOrgPhone() {
		return orgPhone;
	}
	public void setOrgPhone(String orgPhone) {
		this.orgPhone = orgPhone;
	}
	public String getOrgEmail() {
		return orgEmail;
	}
	public void setOrgEmail(String orgEmail) {
		this.orgEmail = orgEmail;
	}
	public String getOrgLogo() {
		return orgLogo;
	}
	public void setOrgLogo(String orgLogo) {
		this.orgLogo = orgLogo;
	}
	public OrgAboutUsDTO getOrgAboutUs() {
		return orgAboutUs;
	}
	public void setOrgAboutUs(OrgAboutUsDTO orgAboutUs) {
		this.orgAboutUs = orgAboutUs;
	}
	public OrgDirectorDetailDTO getOrgDirectorDetail() {
		return orgDirectorDetail;
	}
	public void setOrgDirectorDetail(OrgDirectorDetailDTO orgDirectorDetail) {
		this.orgDirectorDetail = orgDirectorDetail;
	}
	public OrgAchievementDTO getOrgAchievement() {
		return orgAchievement;
	}
	public void setOrgAchievement(OrgAchievementDTO orgAchievement) {
		this.orgAchievement = orgAchievement;
	}
	
	public OrgGallery getOrgGallery() {
		return orgGallery;
	}
	public void setOrgGallery(OrgGallery orgGallery) {
		this.orgGallery = orgGallery;
	}
	public OrganizationDetailDto() {
		super();
		// TODO Auto-generated constructor stub
	}
	public OrganizationDetailDto(Long id, String orgName, String orgAddress, String orgPhone, String orgEmail,
			String orgLogo, OrgAboutUsDTO orgAboutUs, OrgDirectorDetailDTO orgDirectorDetail,
			OrgAchievementDTO orgAchievement, OrgGallery orgGallery) {
		super();
		this.id = id;
		this.orgName = orgName;
		this.orgAddress = orgAddress;
		this.orgPhone = orgPhone;
		this.orgEmail = orgEmail;
		this.orgLogo = orgLogo;
		this.orgAboutUs = orgAboutUs;
		this.orgDirectorDetail = orgDirectorDetail;
		this.orgAchievement = orgAchievement;
		this.orgGallery = orgGallery;
	}	    
}
