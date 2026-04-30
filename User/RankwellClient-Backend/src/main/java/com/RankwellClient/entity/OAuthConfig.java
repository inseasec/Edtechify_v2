package com.RankwellClient.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "oauth_config")
public class OAuthConfig {
	@Id
	private Long id = 1L;

	@Column(name = "user_google_client_id")
	private String userGoogleClientId;

	@Column(name = "user_facebook_app_id")
	private String userFacebookAppId;

	@Column(name = "user_facebook_app_secret")
	private String userFacebookAppSecret;

	@Column(name = "user_github_client_id")
	private String userGithubClientId;

	@Column(name = "user_github_client_secret")
	private String userGithubClientSecret;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUserGoogleClientId() {
		return userGoogleClientId;
	}

	public void setUserGoogleClientId(String userGoogleClientId) {
		this.userGoogleClientId = userGoogleClientId;
	}

	public String getUserFacebookAppId() {
		return userFacebookAppId;
	}

	public void setUserFacebookAppId(String userFacebookAppId) {
		this.userFacebookAppId = userFacebookAppId;
	}

	public String getUserFacebookAppSecret() {
		return userFacebookAppSecret;
	}

	public void setUserFacebookAppSecret(String userFacebookAppSecret) {
		this.userFacebookAppSecret = userFacebookAppSecret;
	}

	public String getUserGithubClientId() {
		return userGithubClientId;
	}

	public void setUserGithubClientId(String userGithubClientId) {
		this.userGithubClientId = userGithubClientId;
	}

	public String getUserGithubClientSecret() {
		return userGithubClientSecret;
	}

	public void setUserGithubClientSecret(String userGithubClientSecret) {
		this.userGithubClientSecret = userGithubClientSecret;
	}
}

