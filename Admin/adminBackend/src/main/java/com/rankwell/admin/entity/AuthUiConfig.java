package com.rankwell.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "auth_ui_config")
public class AuthUiConfig {
	@Id
	private Long id = 1L;

	@Column(name = "user_signin_side_image_url")
	private String userSigninSideImageUrl;

	@Column(name = "user_signup_side_image_url")
	private String userSignupSideImageUrl;

	/** Shown on both user Sign In and Sign Up side panels (headline, accent, tagline). */
	@Column(name = "user_auth_title_primary", length = 200)
	private String userAuthTitlePrimary;

	@Column(name = "user_auth_title_accent", length = 200)
	private String userAuthTitleAccent;

	@Column(name = "user_auth_tagline", length = 500)
	private String userAuthTagline;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUserSigninSideImageUrl() {
		return userSigninSideImageUrl;
	}

	public void setUserSigninSideImageUrl(String userSigninSideImageUrl) {
		this.userSigninSideImageUrl = userSigninSideImageUrl;
	}

	public String getUserSignupSideImageUrl() {
		return userSignupSideImageUrl;
	}

	public void setUserSignupSideImageUrl(String userSignupSideImageUrl) {
		this.userSignupSideImageUrl = userSignupSideImageUrl;
	}

	public String getUserAuthTitlePrimary() {
		return userAuthTitlePrimary;
	}

	public void setUserAuthTitlePrimary(String userAuthTitlePrimary) {
		this.userAuthTitlePrimary = userAuthTitlePrimary;
	}

	public String getUserAuthTitleAccent() {
		return userAuthTitleAccent;
	}

	public void setUserAuthTitleAccent(String userAuthTitleAccent) {
		this.userAuthTitleAccent = userAuthTitleAccent;
	}

	public String getUserAuthTagline() {
		return userAuthTagline;
	}

	public void setUserAuthTagline(String userAuthTagline) {
		this.userAuthTagline = userAuthTagline;
	}
}

