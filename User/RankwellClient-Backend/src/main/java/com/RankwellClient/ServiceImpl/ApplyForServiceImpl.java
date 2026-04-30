package com.RankwellClient.ServiceImpl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.RankwellClient.entity.ApplyFor;
import com.RankwellClient.repository.ApplyForRepository;
import com.RankwellClient.services.ApplyForService;


@Service
public class ApplyForServiceImpl implements ApplyForService{

     private final ApplyForRepository repository;
        
     public ApplyForServiceImpl(ApplyForRepository repository){
       this.repository=repository;
     }
         
      @Override
      public List<ApplyFor> getAllJobs(){
        return repository.findAll();
        }
}