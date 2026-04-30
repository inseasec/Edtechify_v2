package com.rankwell.admin.dto;

import java.util.List;

public class OrgAchievementDTO {

	private Long id;
	private String achivementTitle;
    private List<String> achivementImages;
    
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	
	public OrgAchievementDTO() {
		super();
		// TODO Auto-generated constructor stub
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
	public OrgAchievementDTO(Long id, String achivementTitle, List<String> achivementImages) {
		super();
		this.id = id;
		this.achivementTitle = achivementTitle;
		this.achivementImages = achivementImages;
	}
    
}
