---------------------Chapter -1 ---------------------------------
1. Creata databse fundamental_db on your database server
2. specify db server name, dbname, user, passwd in global_config.properties
3. In that database run below queries:

CREATE TABLE IF NOT EXISTS fundamental_db.environment_setting (
  id BIGINT NOT NULL AUTO_INCREMENT,
  active BIT(1) NOT NULL,
  server_folder_name VARCHAR(255) NOT NULL,
  server_ip VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);


INSERT INTO fundamental_db.environment_setting (active, server_folder_name, server_ip)
VALUES (b'1', 'RankwellData', '127.0.0.1');







---------------------Chapter -2 ---------------------------------
MAke sure below paths are correct in global-config.properties 

ORG_COMMON_DATA_IMG_HOME = F:/Drive/EdtekifyProjects/FundamentalProject/edukify/FilesData/RankwellData/Default_Template_Image
ORG_COMMON_DATA_VID_HOME = F:/Drive/EdtekifyProjects/FundamentalProject/edukify/FilesData/RankwellData/Default_Template_Animation
ORG_COMMON_DATA_IMG_ABOUT = F:/Drive/EdtekifyProjects/FundamentalProject/edukify/FilesData/RankwellData/Default_Template_Image

#Location to store the files in this path..
file.base.path=F:/Drive/EdtekifyProjects/FundamentalProject/edukify/FilesData/


---------------------Chapter -3 ---------------------------------

How to run java project
1. Go to path where pom.xml is present 
   F:\Drive\EdtekifyProjects\FundamentalProject\edukify\Admin\adminBackend

2. run command 
   ./mvnw clean package -DskipTests
  ( It will gneretae jar file in "F:\Drive\EdtekifyProjects\FundamentalProject\edukify\Admin\adminBackend\target" )

4. go to path F:\Drive\EdtekifyProjects\FundamentalProject\edukify\Admin\adminBackend\target

5. then run 
   java -jar adminBackend-0.0.1-SNAPSHOT.jar
   
---------------------Chapter -4 ---------------------------------
   
 To run front-end
 
 1.   F:\Drive\EdtekifyProjects\FundamentalProject\edukify\Admin\client
 
 2. npm install vite
 
 3. npm run  dev
 
   



