package com.RankwellClient.Controller;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.RankwellClient.config.StoragePathResolver;
import com.RankwellClient.entity.AuthUiConfig;
import com.RankwellClient.repository.AuthUiConfigRepository;

/**
 * Exposes the auth side-image URLs. Admin updates {@link AuthUiConfig} in the database when you
 * upload; this controller must return those URLs. Filesystem scan is only a fallback when the DB
 * is empty, otherwise the user site would show an old "latest on disk" image after admin changes.
 */
@RestController
@RequestMapping("/users/auth-ui-config")
public class AuthUiConfigController {
	private final StoragePathResolver pathResolver;
	private final AuthUiConfigRepository authUiConfigRepository;

	public AuthUiConfigController(StoragePathResolver pathResolver, AuthUiConfigRepository authUiConfigRepository) {
		this.pathResolver = pathResolver;
		this.authUiConfigRepository = authUiConfigRepository;
	}

	@GetMapping
	public ResponseEntity<?> get() {
		String signinUrl = "";
		String signupUrl = "";

		// 1) Prefer DB (same row Admin updates when you upload in the Admin app)
		var row = authUiConfigRepository.findById(1L);
		if (row.isPresent()) {
			AuthUiConfig c = row.get();
			if (StringUtils.hasText(c.getUserSigninSideImageUrl())) {
				signinUrl = c.getUserSigninSideImageUrl().trim();
			}
			if (StringUtils.hasText(c.getUserSignupSideImageUrl())) {
				signupUrl = c.getUserSignupSideImageUrl().trim();
			}
		}

		// 2) Fill missing from filesystem (legacy / no DB row)
		ScanResult fs = scanAuthUiFromFileSystem();
		if (!StringUtils.hasText(signinUrl) && StringUtils.hasText(fs.signin)) {
			signinUrl = fs.signin;
		}
		if (!StringUtils.hasText(signupUrl) && StringUtils.hasText(fs.signup)) {
			signupUrl = fs.signup;
		}
		// If still missing one side, align with the other
		if (StringUtils.hasText(signinUrl) && !StringUtils.hasText(signupUrl)) {
			signupUrl = signinUrl;
		} else if (!StringUtils.hasText(signinUrl) && StringUtils.hasText(signupUrl)) {
			signinUrl = signupUrl;
		}

		String titlePrimary = "";
		String titleAccent = "";
		String tagline = "";
		if (row.isPresent()) {
			AuthUiConfig c = row.get();
			if (StringUtils.hasText(c.getUserAuthTitlePrimary())) {
				titlePrimary = c.getUserAuthTitlePrimary().trim();
			}
			if (StringUtils.hasText(c.getUserAuthTitleAccent())) {
				titleAccent = c.getUserAuthTitleAccent().trim();
			}
			if (StringUtils.hasText(c.getUserAuthTagline())) {
				tagline = c.getUserAuthTagline().trim();
			}
		}

		Map<String, Object> out = new HashMap<>();
		out.put("USER_SIGNIN_SIDE_IMAGE_URL", signinUrl);
		out.put("USER_SIGNUP_SIDE_IMAGE_URL", signupUrl);
		out.put("USER_AUTH_TITLE_PRIMARY", titlePrimary);
		out.put("USER_AUTH_TITLE_ACCENT", titleAccent);
		out.put("USER_AUTH_TAGLINE", tagline);
		// Browsers and proxies may cache this GET; config must reflect admin uploads immediately.
		return ResponseEntity.ok()
				.header(HttpHeaders.CACHE_CONTROL, "no-store, no-cache, must-revalidate, max-age=0")
				.header("Pragma", "no-cache")
				.body(out);
	}

	private static final class ScanResult {
		final String signin;
		final String signup;

		ScanResult(String signin, String signup) {
			this.signin = signin;
			this.signup = signup;
		}
	}

	private ScanResult scanAuthUiFromFileSystem() {
		String basePath = pathResolver.getBasePath();
		Path authDir = Path.of(basePath, "OrgData", "AuthUI");
		String signinUrl = "";
		String signupUrl = "";
		try {
			if (!Files.exists(authDir) || !Files.isDirectory(authDir)) {
				authDir = findNewestAuthUiDir(Path.of("C:/edukify/FilesData"));
			}
			if (authDir != null && Files.exists(authDir) && Files.isDirectory(authDir)) {
				String shared = pickLatestUrl(authDir, "authside_");
				if (StringUtils.hasText(shared)) {
					signinUrl = shared;
					signupUrl = shared;
				} else {
					signinUrl = pickLatestUrl(authDir, "signin_");
					signupUrl = pickLatestUrl(authDir, "signup_");
					if (!StringUtils.hasText(signinUrl) && StringUtils.hasText(signupUrl)) {
						signinUrl = signupUrl;
					} else if (StringUtils.hasText(signinUrl) && !StringUtils.hasText(signupUrl)) {
						signupUrl = signinUrl;
					}
				}
			}
		} catch (IOException ignored) {
			// return empty
		}
		return new ScanResult(signinUrl, signupUrl);
	}

	private static String pickLatestUrl(Path authDir, String prefix) throws IOException {
		long bestTs = -1L;
		String bestName = null;
		try (DirectoryStream<Path> stream = Files.newDirectoryStream(authDir)) {
			for (Path p : stream) {
				String name = p.getFileName().toString();
				if (!name.startsWith(prefix)) continue;
				int dot = name.lastIndexOf('.');
				String noExt = dot > 0 ? name.substring(0, dot) : name;
				String tsPart = noExt.substring(prefix.length());
				long ts;
				try {
					ts = Long.parseLong(tsPart);
				} catch (NumberFormatException ex) {
					continue;
				}
				if (ts > bestTs) {
					bestTs = ts;
					bestName = name;
				}
			}
		}
		return bestName == null ? "" : "/OrgData/AuthUI/" + bestName;
	}

	private static Path findNewestAuthUiDir(Path filesDataRoot) throws IOException {
		if (filesDataRoot == null || !Files.exists(filesDataRoot) || !Files.isDirectory(filesDataRoot)) return null;
		try (DirectoryStream<Path> roots = Files.newDirectoryStream(filesDataRoot)) {
			return java.util.stream.StreamSupport.stream(roots.spliterator(), false)
					.map(p -> p.resolve("OrgData").resolve("AuthUI"))
					.filter(p -> Files.exists(p) && Files.isDirectory(p))
					.max(Comparator.comparingLong(AuthUiConfigController::dirLastModifiedSafe))
					.orElse(null);
		}
	}

	private static long dirLastModifiedSafe(Path dir) {
		try {
			return Files.getLastModifiedTime(dir).toMillis();
		} catch (IOException e) {
			return -1L;
		}
	}
}
