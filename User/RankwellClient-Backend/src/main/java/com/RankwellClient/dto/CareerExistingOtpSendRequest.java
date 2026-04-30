package com.RankwellClient.dto;

public class CareerExistingOtpSendRequest {
	private String identifier; // email or mobile
	private String mode; // EMAIL | MOBILE | BOTH

	public String getIdentifier() {
		return identifier;
	}

	public void setIdentifier(String identifier) {
		this.identifier = identifier;
	}

	public String getMode() {
		return mode;
	}

	public void setMode(String mode) {
		this.mode = mode;
	}
}

