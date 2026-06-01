import React from "react";
import carLogo from "../assets/Car-Icon3.png";
import { Link } from "react-router-dom";
import logo from "../assets/logo4.png";
import CaptainDetails from "../components/CaptainDetails";
import RidePopUp from "../components/RidePopUp";
import { useState } from "react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ConfirmRidePopUp from "../components/ConfirmRidePopUp";

const CaptainHome = () => {

  const [ridePopUpPanel,setRidePopUpPanel] = useState(true);
  const ridePopUpPanelRef = useRef(null);

  const [confirmRidePopUpPanel,setConfirmRidePopUpPanel] = useState(false);
  const confirmRidePopUpPanelRef = useRef(null);

  useGSAP(function(){
    if(ridePopUpPanel){
    gsap.to(ridePopUpPanelRef.current,{
        transform:"translateY(0%)"   
    })
  }else{ 
       gsap.to(ridePopUpPanelRef.current,{
        transform:"translateY(100%)"
  })
}
},[ridePopUpPanel])

 useGSAP(function(){
    if(confirmRidePopUpPanel){
    gsap.to(confirmRidePopUpPanelRef.current,{
        transform:"translateY(0%)"   
    })
  }else{ 
       gsap.to(confirmRidePopUpPanelRef.current,{
        transform:"translateY(100%)"
  })
}
},[confirmRidePopUpPanel])
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

      <div className="h-3/5">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="map"
        />
      </div>

      <div className="h-2/5 p-6 -mt-2">
                <CaptainDetails />
      </div>

      <div ref={ridePopUpPanelRef} className="w-full fixed z-10 bottom-0  translate-y-full px-3 py-10 bg-white rounded-t-3xl">
                <RidePopUp setRidePopUpPanel={setRidePopUpPanel} setConfirmRidePopUpPanel={setConfirmRidePopUpPanel} />
      </div>

      <div ref={confirmRidePopUpPanelRef} className="w-full h-screen fixed z-10 bottom-0 translate-y-full px-3 py-10 bg-white">
                <ConfirmRidePopUp setConfirmRidePopUpPanel={setConfirmRidePopUpPanel} setRidePopUpPanel={setRidePopUpPanel} />
      </div>
    </div>
  );
};

export default CaptainHome;
