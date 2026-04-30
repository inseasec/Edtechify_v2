package com.RankwellClient.dto;

public class CareerExistingOtpVerifyRequest {
	private String identifier; // email or mobile
	private String otp;
	private String mode; // EMAIL | MOBILE | BOTH

	public String getIdentifier() {
		return identifier;
	}

	public void setIdentifier(String identifier) {
		this.identifier = identifier;
	}

	public String getOtp() {
		return otp;
	}

	public void setOtp(String otp) {
		this.otp = otp;
	}

	public String getMode() {
		return mode;
	}

	public void setMode(String mode) {
		this.mode = mode;
	}
}

