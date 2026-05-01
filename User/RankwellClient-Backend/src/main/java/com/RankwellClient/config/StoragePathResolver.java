package com.RankwellClient.config;
import org.springframework.stereotype.Component;

import com.RankwellClient.services.EnvironmentSettingService;


  @Component
  public class StoragePathResolver{   

  
   private EnvironmentSettingService environmentSettingService;

   public StoragePathResolver(EnvironmentSettingService environmentSettingService) {
       this.environmentSettingService = environmentSettingService;
   }

    // Base path example: / opt/EdTechData/dynamicFolderName/
    public String getBasePath() { 

        String basePath = environmentSettingService.getBaseStoragePath();
        System.out.println("Here is a basePath " + basePath);

        if (basePath == null || basePath.isBlank()) {
            throw new IllegalStateException("Base storage path is not configured");
        }

        return basePath.endsWith("/") ? basePath : basePath + "/";
    }
  
    public String getCareerBasePath() {
        return getBasePath() ;
    }
}