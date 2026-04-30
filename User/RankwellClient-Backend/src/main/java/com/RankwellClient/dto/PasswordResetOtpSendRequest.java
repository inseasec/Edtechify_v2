package com.RankwellClient.dto;

public class PasswordResetOtpSendRequest {
	private String email;
	private String mobileNo;

	public PasswordResetOtpSendRequest() {}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getMobileNo() {
		return mobileNo;
	}

	public void setMobileNo(String mobileNo) {
		this.mobileNo = mobileNo;
	}
}

