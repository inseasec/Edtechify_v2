package com.RankwellClient.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileConfig implements WebMvcConfigurer {

    private final StoragePathResolver storagePathResolver;

    public FileConfig(StoragePathResolver storagePathResolver) {
        this.storagePathResolver = storagePathResolver;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // UserServiceImpl stores userImg like: accounts/<email-or-mobile>/<filename>
        // and saves to disk under: <basePath>/accounts/<email-or-mobile>/<filename>
        // (basePath comes from StoragePathResolver.getBasePath()).
        registry.addResourceHandler("/accounts/**")
                .addResourceLocations("file:" + storagePathResolver.getBasePath() + "accounts/");
    }
}

