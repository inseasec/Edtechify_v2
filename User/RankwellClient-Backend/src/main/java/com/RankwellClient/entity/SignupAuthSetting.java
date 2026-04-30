package com.RankwellClient.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "signup_auth_setting")
public class SignupAuthSetting {
	@Id
	private Long id = 1L;

	@Enumerated(EnumType.STRING)
	@Column(name = "mode", nullable = false, length = 16)
	private Mode mode = Mode.BOTH;

	@Column(name = "google_enabled", nullable = false)
	private boolean googleEnabled = true;

	@Column(name = "facebook_enabled", nullable = false)
	private boolean facebookEnabled = true;

	@Column(name = "instagram_enabled", nullable = false)
	private boolean instagramEnabled = true;

	@Column(name = "github_enabled", nullable = false)
	private boolean githubEnabled = true;

	public enum Mode {
		NORMAL, EMAIL, MOBILE, BOTH
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Mode getMode() {
		return mode;
	}

	public void setMode(Mode mode) {
		this.mode = mode;
	}

	public boolean isGoogleEnabled() {
		return googleEnabled;
	}

	public void setGoogleEnabled(boolean googleEnabled) {
		this.googleEnabled = googleEnabled;
	}

	public boolean isFacebookEnabled() {
		return facebookEnabled;
	}

	public void setFacebookEnabled(boolean facebookEnabled) {
		this.facebookEnabled = facebookEnabled;
	}

	public boolean isInstagramEnabled() {
		return instagramEnabled;
	}

	public void setInstagramEnabled(boolean instagramEnabled) {
		this.instagramEnabled = instagramEnabled;
	}

	public boolean isGithubEnabled() {
		return githubEnabled;
	}

	public void setGithubEnabled(boolean githubEnabled) {
		this.githubEnabled = githubEnabled;
	}
}

