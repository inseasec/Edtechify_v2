package com.RankwellClient.dto;

public class MobileOtpVerifyRequest {
	private String mobileNo;
	private String otp;

	public MobileOtpVerifyRequest() {}

	public MobileOtpVerifyRequest(String mobileNo, String otp) {
		this.mobileNo = mobileNo;
		this.otp = otp;
	}

	public String getMobileNo() {
		return mobileNo;
	}

	public void setMobileNo(String mobileNo) {
		this.mobileNo = mobileNo;
	}

	public String getOtp() {
		return otp;
	}

	public void setOtp(String otp) {
		this.otp = otp;
	}
}

