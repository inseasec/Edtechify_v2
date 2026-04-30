package com.rankwell.admin.config;
import java.io.File;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.rankwell.admin.services.EnvironmentSettingService;
//import com.rankwell.admin.entity.Courses;
//import com.rankwell.admin.entity.Topics;
//import com.rankwell.admin.entity.Chapters;

@Component 
public class StoragePathResolver {

    @Autowired
    private EnvironmentSettingService environmentSettingService;

    public StoragePathResolver(EnvironmentSettingService environmentSettingService) {
        this.environmentSettingService = environmentSettingService;
    }

    // Base path example: / opt/EdTechData/dynamicFolderName/
    public String getBasePath() {

        String basePath = environmentSettingService.getBaseStoragePath();

        if (basePath == null || basePath.isBlank()) {
            throw new IllegalStateException("Base storage path is not configured");
        }

        return basePath.endsWith("/") ? basePath : basePath + "/";
    }
    
    // Course path folder is creating for to kept the course inside the one folder.
    // Course path → /opt/EdTechData/dynamicFolderName/Courses/
    // public String getCourseBasePath() {
    //     return getBasePath() + "Courses/"; 
    // }

    public String getCourseBasePath() {
        String coursePath = getBasePath() + "Courses/";
        File courseFolder = new File(coursePath);
        if (!courseFolder.exists()) {
            boolean created = courseFolder.mkdirs();
            if (!created) {
                throw new RuntimeException("Failed to create base Courses folder at: " + coursePath);
            }
        }
        return coursePath;
    }


    // // opt/EdTechData/dynamicFolderName/Comprehensive/
    // public String getComprehensivePath() {
    //     return getBasePath() + "Comprehensive/";
    // }

    // // opt/EdTechData/dynamicFolderName/Notes/
    // public String getNotesPath() {
    //     return getBasePath() + "Notes/";
    // }

    // // opt/EdTechData/dynamicFolderName/Videos/
    // public String getVideosPath() {
    //     return getBasePath() + "Videos/";
    // }

    // Get course folder path
//    public File getCourseFolder(Courses course) {
//
//        if (course == null) {
//            throw new RuntimeException("Course is null");
//        }
//
//        String courseTypeFolder;
//        String type = course.getCourseType();
//
//        if (type == null) {
//            throw new RuntimeException("Course type is null for course: " + course.getCourseName());
//        }
//
//        switch (type.toUpperCase()) {
//            case "COMPLETE COURSE":
//                courseTypeFolder = "Comprehensive";
//                break;
//            case "NOTES COURSE":
//                courseTypeFolder = "Notes";
//                break;
//            case "VIDEOS COURSE":
//                courseTypeFolder = "Videos";
//                break;
//            default:
//                courseTypeFolder = type.replace(" ", "_");
//        }
//
//        String deptFolderName = course.getDepartments().getDeptName().replace(" ", "_");
//        String courseFolderName = course.getCourseName().replace(" ", "_");
//
//        File courseFolder = new File(
//            getCourseBasePath() + courseTypeFolder + "/" + deptFolderName + "/" + courseFolderName
//        );
//
//        if (!courseFolder.exists() || !courseFolder.isDirectory()) {
//            throw new RuntimeException("Course folder not found: " + courseFolder.getAbsolutePath());
//        }
//
//        return courseFolder;
//    }
//
//    // Get chapter folder path
//    public File getChapterFolder(Courses course, Chapters chapter) {
//        File courseFolder = getCourseFolder(course);
//        return new File(courseFolder, chapter.getServerFileName());
//    }
//
//    // Get Topic folder path
//    public File getTopicFolder(Courses course, Topics topic) {
//        File chapterFolder = getChapterFolder(course, topic.getChapters());
//        return new File(chapterFolder, topic.getServerFileName());
//    }

}
