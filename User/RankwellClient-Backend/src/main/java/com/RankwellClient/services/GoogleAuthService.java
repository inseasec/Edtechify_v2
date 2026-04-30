package com.RankwellClient.services;

public interface GoogleAuthService {
	String authenticateWithIdToken(String idToken);
	String getClientId();
}

