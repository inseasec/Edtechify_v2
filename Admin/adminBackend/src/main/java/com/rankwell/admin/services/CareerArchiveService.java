package com.rankwell.admin.services;
import  com.rankwell.admin.entity.ArchivedCareers;
import java.util.List; 

public interface CareerArchiveService { 
   public String archiveCareer(Long careerId);  

   public List<ArchivedCareers> getAllArchived();
   
}