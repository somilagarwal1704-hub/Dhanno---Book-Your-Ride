import React, { useRef, useState } from "react";
import logo from "../assets/logo4.png";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "remixicon/fonts/remixicon.css";
import LocationSearchPanel from "../components/LocationSearchPanel";

import VehiclePanel from "../components/VehiclePanel";
import ConfirmedRide from "../components/ConfirmedRide";
import LookingForDriver from "../components/LookingForDriver";
import WaitingForDriverPanel from "../components/WaitingForDriverPanel";

const Home = () => {
  const [pickup, setPickUp] = useState("");
  const [destination, setDestination] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const lookingForDriverPanelRef = useRef(null);
  const vehiclePanelRef = useRef(null);
  const waitingForDriverPanelRef = useRef(null);
  const confirmRidePanelRef = useRef(null);
  const panelRef = useRef(null);
  const panelCloseRef = useRef(null);
  const [vehiclePanel,setVehiclePanel]=useState(false);
  const [confirmRidePanel,setConfirmRidePanel] =useState(false);
  const [lookingForDriverPanel,setLookingForDriverPanel] = useState(false);
  const [waitingForDriverPanel,setWaitingForDriverPanel] = useState(false);

  const submitHandler = (e) => {
    e.preventDefault();
  };

  useGSAP(
    function () {
      if (panelOpen) {
        gsap.to(panelRef.current, {
          height: "70%",
          padding: "24px",
          //opacity:1
        });
        gsap.to(panelCloseRef.current, {
          opacity: 1,
        });
      } else {
        gsap.to(panelRef.current, {
          height: "0",
          padding:"0px"
          //opacity:0
        });
        gsap.to(panelCloseRef.current, {
          opacity: 0,
        });
      }
    },
    [panelOpen],
  );

  useGSAP(function(){
    if(vehiclePanel){
    gsap.to(vehiclePanelRef.current,{
        transform:"translateY(0%)"   
    })
  }else{ 
       gsap.to(vehiclePanelRef.current,{
        transform:"translateY(100%)"
  })
}
},[vehiclePanel])

 useGSAP(function(){
    if(confirmRidePanel){
    gsap.to(confirmRidePanelRef.current,{
        transform:"translateY(0%)"   
    })
  }else{ 
       gsap.to(confirmRidePanelRef.current,{
        transform:"translateY(100%)"
  })
}
},[confirmRidePanel])

 useGSAP(function(){
    if(lookingForDriverPanel){
    gsap.to(lookingForDriverPanelRef.current,{
        transform:"translateY(0%)"   
    })
  }else{ 
       gsap.to(lookingForDriverPanelRef.current,{
        transform:"translateY(100%)"
  })
}
},[lookingForDriverPanel])

useGSAP(function(){
    if(waitingForDriverPanel){
    gsap.to(waitingForDriverPanelRef.current,{
        transform:"translateY(0%)"   
    })
  }else{ 
       gsap.to(waitingForDriverPanelRef.current,{
        transform:"translateY(100%)"
  })
}
},[waitingForDriverPanel])
  return (
    <div className="h-screen relative overflow-hidden">
      <img className="w-30 m-5 absolute top-0 left-0 " src={logo} alt="logo" />

      <div className="h-full w-screen">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="map"
        />
      </div>
      <div className="flex flex-col justify-end h-screen absolute top-0 w-full ">
        <div className="h-[30%] bg-white p-5 relative ">
          <h5
            ref={panelCloseRef}
            onClick={() => {
              setPanelOpen(false);
            }}
            className="absolute opacity-0 top-6 right-6 text-2xl"
          >
            <i className="ri-arrow-down-wide-line"></i>
          </h5>
          <h4 className="text-2xl font-semibold ">Find a trip</h4>
          <form
            onSubmit={(e) => {
              submitHandler(e);
            }}
          >
            <div className="line absolute h-16 w-1 top-[45%] left-10 bg-gray-700 rounded-full"></div>
            <input
              onClick={() => {
                setPanelOpen(true);
              }}
              className="bg-[#e6e6e9] px-12 py-2 text-lg rounded-lg w-full mt-5"
              type="text"
              value={pickup}
              onChange={(e) => {
                setPickUp(e.target.value);
              }}
              placeholder="Add a pick-up location"
            />
            <input
              onClick={() => {
                setPanelOpen(true);
              }}
              className="bg-[#e6e6e9] px-12 py-2 text-lg rounded-lg w-full mt-3"
              type="text"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
              }}
              placeholder="Enter your destination"
            />
          </form>
        </div>
        <div ref={panelRef} className="bg-white h-0 overflow-hidden">
          <LocationSearchPanel setPanelOpen={setPanelOpen} setVehiclePanel={setVehiclePanel} />
        </div>
      </div>


        // Vehicle Panel
      <div ref={vehiclePanelRef} className="w-full fixed z-10  bottom-0 translate-y-full px-3 py-10 bg-white rounded-t-3xl">
        <VehiclePanel setConfirmRidePanel={setConfirmRidePanel} setVehiclePanel={setVehiclePanel} />  
      </div>

      // Confirmed Ride Page

      <div ref={confirmRidePanelRef} className="w-full fixed z-10  bottom-0 translate-y-full px-3 py-10 bg-white rounded-t-3xl">
       <ConfirmedRide setLookingForDriverPanel={setLookingForDriverPanel} setConfirmRidePanel={setConfirmRidePanel} setVehiclePanel={setVehiclePanel} />
      </div>

      <div ref={lookingForDriverPanelRef}  className="w-full fixed z-10  bottom-0 translate-y-full px-3 py-10 bg-white rounded-t-3xl">
       <LookingForDriver setLookingForDriverPanel={setLookingForDriverPanel} setConfirmRidePanel={setConfirmRidePanel} />
      </div>

       <div ref={waitingForDriverPanelRef} className="w-full fixed z-10  bottom-0 translate-y-full  px-3 py-10 bg-white rounded-t-3xl">
       <WaitingForDriverPanel setLookingForDriverPanel={setLookingForDriverPanel} setWaitingForDriverPanel={setWaitingForDriverPanel} />
      </div>
    </div>
  );
};

export default Home;
