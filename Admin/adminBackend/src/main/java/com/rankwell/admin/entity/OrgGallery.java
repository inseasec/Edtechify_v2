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
public class OrgGallery {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
	@Column(columnDefinition = "TEXT")
    private String galleryTitle;
    
    @ElementCollection
    @CollectionTable(
        name = "gallery_images",
        joinColumns = @JoinColumn(name = "gallery_id")
    )
    @Column(name = "image_path")
    private List<String> galleryImages = new ArrayList<>();
    

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


	public String getGalleryTitle() {
		return galleryTitle;
	}


	public void setGalleryTitle(String galleryTitle) {
		this.galleryTitle = galleryTitle;
	}

	public List<String> getGalleryImages() {
		return galleryImages;
	}


	public void setGalleryImages(List<String> galleryImages) {
		this.galleryImages = galleryImages;
	}


	public OrganizationDetail getOrganization() {
		return organization;
	}


	public void setOrganization(OrganizationDetail organization) {
		this.organization = organization;
	}


	public OrgGallery() {
		super();
		// TODO Auto-generated constructor stub
	}


	public OrgGallery(Long id, String galleryTitle, List<String> galleryImages, OrganizationDetail organization) {
		super();
		this.id = id;
		this.galleryTitle = galleryTitle;
		this.galleryImages = galleryImages;
		this.organization = organization;
	}
    
}
