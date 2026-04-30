package com.RankwellClient.services;

import com.RankwellClient.dto.EnvironmentSettingDto;
import com.RankwellClient.entity.EnvironmentSetting;


public interface EnvironmentSettingService {

    EnvironmentSetting getDetails();
    
    EnvironmentSetting getEnvironmentSetting();

    EnvironmentSetting saveOrUpdate(EnvironmentSettingDto dto);

    String getBaseStoragePath();

    EnvironmentSetting getById(Long id);

    void deactivateAll();

}