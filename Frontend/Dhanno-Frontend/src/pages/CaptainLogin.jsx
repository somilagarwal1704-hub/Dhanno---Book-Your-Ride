import React, { useContext, useState } from 'react'
import logo from "../assets/logo4.png";
import { Link } from 'react-router-dom';
import { CaptainDataContext } from '../context/CaptainContext.jsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CaptainLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [captainData,setCaptainData]=useState([])

    const {setCaptain}= useContext(CaptainDataContext);
    const navigate = useNavigate();
  
    const submitHandler= async (e)=>{
      e.preventDefault()

      const CaptainData={
        email:email,
        password:password
      }

      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`,CaptainData)

      if(response.status===200){
        const data = response.data
        setCaptain(data.captain)
        localStorage.setItem("token",data.token)
        navigate("/captain/home")
      }

      setEmail("")
      setPassword("")
    }
  return (
    <div className="p-7 h-screen flex flex-col justify-between">
      <div>
        <img className="w-30 mb-5 " src={logo} alt="logo" />
        <form onSubmit={(e)=>{
            submitHandler(e)}}  >
          <h3 className="text-lg font-medium mb-2">What's your email</h3>
          <input
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
            required
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="email@example.com"
          />
          <h3 className="text-lg font-medium mb-2">Enter Password</h3>
          <input
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
            required
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder="password"
          />
          <button className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 w-full text-lg placeholder:text-base">
            Login
          </button>
        </form>
        <p className="text-center">
          Join a fleet?{" "}
          <Link to="/captain/signup" className="text-blue-600">
            Register as a Captain
          </Link>
        </p>
      </div>
      <div>
        <Link to="/user/login" className="bg-[#d5622d] text-white flex items-center justify-center font-semibold mb-5 rounded px-4 py-2 w-full text-lg placeholder:text-base">
          Sign in as User
        </Link>
      </div>
    </div>
  )
}

export default CaptainLogin
