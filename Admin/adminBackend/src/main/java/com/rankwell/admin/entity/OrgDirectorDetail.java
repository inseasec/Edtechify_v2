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


@Entity
@Table
public class OrgDirectorDetail {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String directorName;
	
	private String role;

	@Lob
	@Column(columnDefinition = "TEXT")
	private String aboutDirector;

	private String directorImage; // file path or URL

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

	public String getDirectorName() {
		return directorName;
	}

	public void setDirectorName(String directorName) {
		this.directorName = directorName;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public String getAboutDirector() {
		return aboutDirector;
	}

	public void setAboutDirector(String aboutDirector) {
		this.aboutDirector = aboutDirector;
	}

	public String getDirectorImage() {
		return directorImage;
	}

	public void setDirectorImage(String directorImage) {
		this.directorImage = directorImage;
	}

	public OrganizationDetail getOrganization() {
		return organization;
	}

	public void setOrganization(OrganizationDetail organization) {
		this.organization = organization;
	}

	public OrgDirectorDetail() {
		super();
		// TODO Auto-generated constructor stub
	}

	public OrgDirectorDetail(Long id, String directorName, String role, String aboutDirector, String directorImage,
			OrganizationDetail organization) {
		super();
		this.id = id;
		this.directorName = directorName;
		this.role = role;
		this.aboutDirector = aboutDirector;
		this.directorImage = directorImage;
		this.organization = organization;
	}
	
}
