import {useNavigate} from "react-router-dom"
import { useEffect } from "react"
import axios from "axios"

const CaptainLogout = ()=>{

     const navigate = useNavigate()

     useEffect(()=>{

     const logout = async() =>{

          const token = localStorage.getItem("token");

          try{
          const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/profile`,{},{
               headers:{
                    Authorization:`Bearer ${token}`
               }
          })

          if(response.status===200){
               localStorage.removeItem("token")
               navigate("/captain/login")
          }
     }
     catch(err){
     console.log(err)
}
}
logout()  
},[])

     return(
          <div>
               Logging out...
          </div>
     )    
}

export default CaptainLogout