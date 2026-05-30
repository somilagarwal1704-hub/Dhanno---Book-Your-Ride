import React from 'react'
import logo from "../assets/logo4.png";
import bgImage from "../assets/traffic-light.jpg";
import { Link } from 'react-router-dom';


const Start = () => {
  return (
    <div>
      <div className='h-screen w-full flex flex-col justify-between'
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover" }}>
          <img className='w-30 mt-9 ml-5' src={logo} alt="logo" />
          <div className='bg-white py-5 px-5 pb-7'>
          <h2 className='text-2xl font-bold'>Get Started with Dhanno</h2>
          <Link to="/user/login" className='flex items-center justify-center w-full bg-black text-white py-3 rounded mt-5'>Continue</Link>
          </div>
      </div>
    </div>
  )
}

export default Start
