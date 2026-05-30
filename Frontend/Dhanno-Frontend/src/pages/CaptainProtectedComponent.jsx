import React, { useEffect } from 'react'
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { CaptainDataContext } from '../context/CaptainContext'

const CaptainProtectedComponent = ({ children }) => {

   const navigate = useNavigate()
   const token = localStorage.getItem("token")

   const { captain, setCaptain } = React.useContext(CaptainDataContext)

   const [isLoading, setIsLoading] = React.useState(true)

   useEffect(() => {

      if (!token) {
         navigate("/captain/login")
         return
      }

      axios.get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
         headers: {
            Authorization: `Bearer ${token}`
         }
      })
         .then(response => {

            if (response.status === 200) {
               setCaptain(response.data.captain)
               setIsLoading(false)
            }

         })
         .catch(err => {
            console.log(err)
            localStorage.removeItem("token")
            navigate("/captain/login")
         })

   }, [])

   if (isLoading) {
      return <div>Loading...</div>
   }

   return children
}

export default CaptainProtectedComponent