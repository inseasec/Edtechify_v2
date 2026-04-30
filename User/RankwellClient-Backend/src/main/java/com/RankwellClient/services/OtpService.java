package com.RankwellClient.services;

public interface OtpService {
	void sendEmailOtp(String email);
	boolean verifyEmailOtp(String email, String otp);

	void sendMobileOtp(String mobileNo);
	boolean verifyMobileOtp(String mobileNo, String otp);
}

