import React, { useRef, useState } from 'react'
import { Link } from "react-router-dom";
import logo from "../assets/logo4.png";
import FinishRide from '../components/FinishRide';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const CaptainRiding = () => {

     const [finishRidePanel,setFinishRidePanel] = useState(false);
     const finishRidePanelRef = useRef(null)

      useGSAP(function(){
    if(finishRidePanel){
    gsap.to(finishRidePanelRef.current,{
        transform:"translateY(0%)"   
    })
  }else{ 
       gsap.to(finishRidePanelRef.current,{
        transform:"translateY(100%)"
  })
}
},[finishRidePanel])
  return (
    <div className="h-screen overflow-hidden">
      <div>
        <img
          className="w-20 ml-4 mt-6 absolute top-0 left-0 "
          src={logo}
          alt="logo"
        />
        <Link
          to="/home"
          className="w-10 h-10 rounded-full fixed flex justify-center items-center top-2 right-2 bg-white"
        >
          <i className="text-lg font-medium ri-logout-box-r-line"></i>
        </Link>
      </div>

      <div className="h-4/5">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="map"
        />
      </div>

      <div className="h-1/5 p-6 flex items-center justify-between relative bg-yellow-400 pt-10"
      onClick={()=>{
          setFinishRidePanel(true)
      }}
      >
      <h5 onClick={()=>{        
                     }} className="top-0 text-center w-[90%] absolute p-1"><i className="text-3xl text-gray-800 ri-arrow-up-wide-line"></i></h5> 
          <h4 className="text-xl font-semibold">4 KM away</h4>
          <button className=' bg-green-600 scale-100 text-white font-semibold rounded-lg p-3 px-10'>Complete Ride</button>          
      </div>

      <div ref={finishRidePanelRef} className="w-full fixed z-10 bottom-0  translate-y-full px-3 py-10 bg-white rounded-t-3xl">
                <FinishRide setFinishRidePanel={setFinishRidePanel} />
      </div>
    </div>
  )
}

export default CaptainRiding
