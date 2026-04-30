package com.RankwellClient.services;

import org.springframework.web.multipart.MultipartFile;
import com.RankwellClient.dto.CareerRequestDto;
import com.RankwellClient.entity.Careers;

public interface CareersService {

    Careers createCareer(CareerRequestDto request, MultipartFile resumeFile, MultipartFile videoFile);
    // public String getBasePath();

}
  