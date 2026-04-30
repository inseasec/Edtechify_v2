package com.rankwell.admin.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.List;
import java.util.ArrayList;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;


@Entity
@Table
public class OrgAboutUs {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
	private String aboutWallpaper;
	
	@Lob
	@Column(columnDefinition = "TEXT")
    private String vision;
	
	@Lob
	@Column(columnDefinition = "TEXT")
    private String mission;
	
	@Lob
	@Column(columnDefinition = "TEXT")
    private String orgValues;

    @OneToOne
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonBackReference
    private OrganizationDetail organization;

	@OneToMany(mappedBy = "aboutUs", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AboutImageTemplate> images;

	public Long getId() {
		return id;
	}

	public void setId(Long id) { 
		this.id = id;
	}


	public List<AboutImageTemplate> getImages() {
     return images;
   }

    public void setImages(List<AboutImageTemplate> images) {
      this.images = images;
    }

	public String getAboutWallpaper() {
		return aboutWallpaper;
	}

	public void setAboutWallpaper(String aboutWallpaper) {
		this.aboutWallpaper = aboutWallpaper;
	}

	public String getVision() {
		return vision;
	}

	public void setVision(String vision) {
		this.vision = vision;
	}

	public String getMission() {
		return mission;
	}

	public void setMission(String mission) {
		this.mission = mission;
	}

	public String getOrgValues() {
		return orgValues;
	}

	public void setOrgValues(String orgValues) {
		this.orgValues = orgValues;
	}

	public OrganizationDetail getOrganization() {
		return organization;
	}

	public void setOrganization(OrganizationDetail organization) {
		this.organization = organization;
	}

	public OrgAboutUs() {
		super();
		// TODO Auto-generated constructor stub
	}

	public OrgAboutUs(Long id, String aboutWallpaper, String vision, String mission, String orgValues,
			OrganizationDetail organization) {
		super();
		this.id = id;
		this.aboutWallpaper = aboutWallpaper;
		this.vision = vision;
		this.mission = mission;
		this.orgValues = orgValues;
		this.organization = organization;
	}
    
}
