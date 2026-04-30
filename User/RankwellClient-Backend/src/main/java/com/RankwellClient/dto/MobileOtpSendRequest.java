package com.RankwellClient.dto;

public class MobileOtpSendRequest {
	private String mobileNo;

	public MobileOtpSendRequest() {}

	public MobileOtpSendRequest(String mobileNo) {
		this.mobileNo = mobileNo;
	}

	public String getMobileNo() {
		return mobileNo;
	}

	public void setMobileNo(String mobileNo) {
		this.mobileNo = mobileNo;
	}
}

