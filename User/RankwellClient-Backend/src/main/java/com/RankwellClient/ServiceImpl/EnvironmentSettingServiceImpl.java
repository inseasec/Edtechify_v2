package com.RankwellClient.ServiceImpl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.RankwellClient.dto.EnvironmentSettingDto;
import com.RankwellClient.entity.EnvironmentSetting;
import com.RankwellClient.repository.EnvironmentSettingRepository;
import com.RankwellClient.services.EnvironmentSettingService;

import jakarta.transaction.Transactional;


@Service
public class EnvironmentSettingServiceImpl implements EnvironmentSettingService {

    @Value("${file.base.path}")
    private String basePath;

    private final EnvironmentSettingRepository repository;

    public EnvironmentSettingServiceImpl(EnvironmentSettingRepository repository) {
        this.repository = repository;
    }


    @Override
    public EnvironmentSetting getDetails() {
        return repository.findTopByOrderByIdAsc()
                .orElseThrow(() ->
                        new RuntimeException(
                                "Environment setting not found"
                             ) );
                         }

    @Override
    public EnvironmentSetting getEnvironmentSetting() {
        return repository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Environment setting not found"));
    }

    @Override
    public EnvironmentSetting saveOrUpdate(EnvironmentSettingDto dto) {
        EnvironmentSetting setting = repository.findTopByOrderByIdAsc()
                .orElse(new EnvironmentSetting());

        setting.setServerIp(dto.getServerIp());
        setting.setServerFolderName(dto.getServerFolderName());

        return repository.save(setting);
    }

    @Override
    public String getBaseStoragePath() {
        // return "/opt/EdTechData/" + getEnvironmentSetting().getServerFolderName() + "/";
        return basePath + getEnvironmentSetting().getServerFolderName() + "/";
    }


    @Override
    public EnvironmentSetting getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Environment setting not found"));
    }

    @Override
    @Transactional
    public void deactivateAll() {
        repository.deactivateAll();
    }



    
}
