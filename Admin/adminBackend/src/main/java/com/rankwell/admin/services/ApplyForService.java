package com.rankwell.admin.services;

import com.rankwell.admin.entity.ApplyFor;
import com.rankwell.admin.dto.ApplyForDto;
import java.util.List;

public interface ApplyForService{ 

   public ApplyFor createJob(ApplyForDto apply);

   public List<ApplyFor> getAllJobs();

     public ApplyFor getJobsById(Long id);

     public ApplyFor updateJob(Long id,ApplyForDto job);

     public String deleteJObById(Long id);
    
}