import React, { useContext, useEffect } from 'react'
import {useNavigate} from "react-router-dom"
import axios from "axios"
import { UserDataContext } from '../context/UserContext'

const UserProtectedComponent = ({children}) => {
     const navigate = useNavigate()
     const token = localStorage.getItem("token")
     const {user,setUser}=useContext(UserDataContext)

     const [isLoading, setIsLoading] = React.useState(true)
     
     useEffect(()=>{
          if(!token){
               navigate("/user/login")
               return
          }
          
          axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`,{
               headers:{
                    Authorization:`Bearer ${token}`
               }
          }).then(response=>{
               if(response.status===200){
                    setUser(response.data.user)
                    setIsLoading(false)
               }
          })
          .catch(err => {
            console.log(err)
            localStorage.removeItem("token")
            navigate("/user/login")
         })
          
     },[token])
     if(isLoading){
          return(
          <div>
               Loading...
          </div>
          )
     }
          
  return children
}

export default UserProtectedComponent
