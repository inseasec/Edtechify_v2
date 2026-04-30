package com.RankwellClient.config;
//import com.RankwellClient.services.EnvironmentSettingService;
import java.io.File;
import org.springframework.stereotype.Component;


  @Component
  public class StoragePathResolver{   

  
//    private EnvironmentSettingService environmentSettingService;

//    public StoragePathResolver(EnvironmentSettingService environmentSettingService) {
//        this.environmentSettingService = environmentSettingService;
//    }

    // Base path example: / opt/EdTechData/dynamicFolderName/
    public String getBasePath() { 

        // This must point to the folder that CONTAINS the `accounts/` directory.
        // In your repo, the image exists under: C:/edukify/FilesData/RankwellData/accounts/...
        String basePath = "C:/edukify/FilesData/RankwellData";

        // Fallback for older deployments (if you use this path on server).
        if (!new File(basePath).exists()) {
            basePath = "C:/opt/EdTechData/RankwellData";
        }

        System.out.println("Here is a basePath " + basePath);

        if (basePath == null || basePath.isBlank()) {
            throw new IllegalStateException("Base storage path is not configured");
        }

        return basePath.endsWith("/") ? basePath : basePath + "/";
    }
  
    //opt/EdTechData/dynamicFolderName/Comprehensive/
    public String getCareerBasePath() {
        return getBasePath() ;
    }
}