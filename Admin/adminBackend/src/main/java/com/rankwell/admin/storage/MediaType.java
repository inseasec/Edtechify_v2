package com.rankwell.admin.storage;

public enum MediaType {
 
    IMAGE("images"), 
    ANIMATION("animations"); 

    private final String folder;

    MediaType(String folder) { 
        this.folder = folder;
    }

    public String getFolder() {
        return folder; 
    }
  } 
