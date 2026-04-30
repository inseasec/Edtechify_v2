
package com.rankwell.admin.services;
import com.rankwell.admin.entity.EnvironmentSetting;
import com.rankwell.admin.dto.EnvironmentSettingDto;

public interface EnvironmentSettingService {

    EnvironmentSetting getDetails();
    
    EnvironmentSetting getEnvironmentSetting();

    EnvironmentSetting saveOrUpdate(EnvironmentSettingDto dto);

    String getBaseStoragePath();

    EnvironmentSetting getById(Long id);

    void deactivateAll();

}