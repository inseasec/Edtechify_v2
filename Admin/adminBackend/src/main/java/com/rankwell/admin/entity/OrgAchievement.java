package com.rankwell.admin.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;


@Entity
@Table
public class OrgAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
	@Column(columnDefinition = "TEXT")
    private String achivementTitle;
    
    @ElementCollection
    @CollectionTable(
        name = "achievement_images",
        joinColumns = @JoinColumn(name = "achievement_id")
    )
    @Column(name = "image_path")
    private List<String> achivementImages = new ArrayList<>();
    

    @OneToOne
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonBackReference
    private OrganizationDetail organization;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getAchivementTitle() {
		return achivementTitle;
	}

	public void setAchivementTitle(String achivementTitle) {
		this.achivementTitle = achivementTitle;
	}

	public List<String> getAchivementImages() {
		return achivementImages;
	}

	public void setAchivementImages(List<String> achivementImages) {
		this.achivementImages = achivementImages;
	}

	public OrganizationDetail getOrganization() {
		return organization;
	}

	public void setOrganization(OrganizationDetail organization) {
		this.organization = organization;
	}

	public OrgAchievement() {
		super();
		// TODO Auto-generated constructor stub
	}

	public OrgAchievement(Long id, String achivementTitle, List<String> achivementImages,
			OrganizationDetail organization) {
		super();
		this.id = id;
		this.achivementTitle = achivementTitle;
		this.achivementImages = achivementImages;
		this.organization = organization;
	}
    
}
