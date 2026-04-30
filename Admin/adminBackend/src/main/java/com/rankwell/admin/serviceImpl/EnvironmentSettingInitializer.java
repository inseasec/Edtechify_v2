package com.rankwell.admin.serviceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.rankwell.admin.entity.EnvironmentSetting;
import com.rankwell.admin.repository.EnvironmentSettingRepository;


@Component
public class EnvironmentSettingInitializer implements CommandLineRunner {

    @Autowired
    private EnvironmentSettingRepository repository;

    @Value("${app.env.server-ip}")
    private String serverIp;

    @Value("${app.env.server-folder}")
    private String serverFolder;

    @Override
    public void run(String... args) {


        EnvironmentSetting env = repository.findByActiveTrue()
                .orElse(new EnvironmentSetting());

        boolean isNew = env.getId() == null;

        // Always update from properties
        env.setServerIp(serverIp);
        env.setServerFolderName(serverFolder);
        env.setActive(true);

        repository.save(env);

        if (isNew) {
            System.out.println("✅ Default EnvironmentSetting inserted");
        } else {
            System.out.println("✅ EnvironmentSetting already exists");
        }
    }
}
