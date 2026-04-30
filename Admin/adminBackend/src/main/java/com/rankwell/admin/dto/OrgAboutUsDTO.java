package com.rankwell.admin.dto;

public class OrgAboutUsDTO {

	private Long id;
	private String aboutWallpaper;
	private String vision;
	private String mission;
	private String orgValues;
	

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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

	public OrgAboutUsDTO() {
		super();
		// TODO Auto-generated constructor stub
	}

	public OrgAboutUsDTO(Long id, String aboutWallpaper, String vision, String mission, String orgValues) {
		super();
		this.id = id;
		this.aboutWallpaper = aboutWallpaper;
		this.vision = vision;
		this.mission = mission;
		this.orgValues = orgValues;
	}

}
