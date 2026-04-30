import  {jwtDecode } from "jwt-decode";

export const decodeToken=()=>{
    try{
        const token = localStorage.getItem("authToken");

        const decode = jwtDecode(token);
        return decode.user_id;
        
    }catch(error){
        return null;


    }
}
