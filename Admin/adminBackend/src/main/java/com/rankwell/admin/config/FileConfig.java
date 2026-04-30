package com.rankwell.admin.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileConfig implements WebMvcConfigurer{
	
    @Value("${app.commondata.path.img_home}")
    private String uploadImgDirHome;

    @Value("${app.commondata.path.vid_home}")
    private String uploadVidDirHome;

    @Value("${app.commondata.path.img_about}")
    private String uploadImgDirAbout;

    @Autowired
    private StoragePathResolver storagePathResolver;
	
	@Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + uploadImgDirHome + "/");
      
        registry.addResourceHandler("/videos/**")
                .addResourceLocations("file:" + uploadVidDirHome + "/");

        registry.addResourceHandler("/OrgData/**")
                .addResourceLocations("file:" + storagePathResolver.getBasePath() + "OrgData/");

        registry.addResourceHandler("/accounts/**")
                .addResourceLocations("file:" + storagePathResolver.getBasePath() + "accounts/");

        registry.addResourceHandler("/Careers/*")
                .addResourceLocations("file:" + storagePathResolver.getBasePath() + "Careers/");

       

    }

}