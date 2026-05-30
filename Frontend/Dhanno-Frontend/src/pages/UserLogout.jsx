import React, { useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from "react-router-dom"

const UserLogout = () => {

    const navigate = useNavigate()

    useEffect(() => {

        const logout = async () => {

            const token = localStorage.getItem("token")

            try {

                const response = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}/users/logout`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                if (response.status === 200) {

                    localStorage.removeItem("token")

                    navigate("/user/login")
                }

            } catch (error) {
                console.log(error)
            }
        }

        logout()

    }, [])

    return (
        <div>
            Logging out...
        </div>
    )
}

export default UserLogout