package com.rankwell.admin.storage;

public enum Module { 

    ABOUT_US("AboutUs"),
    GALLERY("Gallery"),
    HOME_PAGE("HomePage");

    private final String folder;

    Module(String folder) {
        this.folder = folder;  
    }

    public String getFolder() {  
        return folder;
    }
} 
 