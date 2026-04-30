package com.rankwell.admin.serviceImpl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rankwell.admin.dto.EnvironmentSettingDto;
import com.rankwell.admin.entity.EnvironmentSetting;
import com.rankwell.admin.repository.EnvironmentSettingRepository;
import com.rankwell.admin.services.EnvironmentSettingService;

@Service
public class EnvironmentSettingServiceImpl implements EnvironmentSettingService {

    @Value("${app.env.server-ip}")
    private String serverIp;

    @Value("${app.env.server-folder}")
    private String serverFolder;

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

        // return repository.findAll()
        //         .stream()
        //         .findFirst()
        //         .orElseThrow(() ->
        //                 new RuntimeException("Environment setting not found"));
        
        System.out.println("✅ EnvironmentSetting record updated");
        return repository.findByActiveTrue()
            .orElseGet(() -> {
                EnvironmentSetting env = new EnvironmentSetting();
                env.setServerIp(serverIp);
                env.setServerFolderName(serverFolder);
                env.setActive(true);
                return repository.save(env);
            });
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
