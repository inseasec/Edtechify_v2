package com.rankwell.admin.dto;

public class OrgDirectorDetailDTO {

	private Long id;
	private String directorName;
    private String role;
    private String aboutDirector;
    private String directorImage;
    
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

	public OrgDirectorDetailDTO() {
		super();
		// TODO Auto-generated constructor stub
	}

	public OrgDirectorDetailDTO(Long id, String directorName, String role, String aboutDirector,
			String directorImage) {
		super();
		this.id = id;
		this.directorName = directorName;
		this.role = role;
		this.aboutDirector = aboutDirector;
		this.directorImage = directorImage;
	}

}
