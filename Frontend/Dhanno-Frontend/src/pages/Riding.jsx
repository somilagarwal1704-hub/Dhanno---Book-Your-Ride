import React from "react";
import carLogo from "../assets/Car-Icon3.png";
import { Link } from "react-router-dom";

const Riding = () => {
  return (
    <div className="h-screen overflow-hidden">
     <Link to="/home" className="w-10 h-10 rounded-full fixed flex justify-center items-center top-2 right-2 bg-white">
               <i className="text-lg font-medium ri-home-5-line"></i>
     </Link>
      <div className="h-1/2">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="map"
        />
      </div>
      <div className="h-1/2 p-4 ">
        <div className="flex items-center justify-between w-full mb-4 p-3 transition-all">
          <img className="h-20 " src={carLogo} alt="" />
          <div className="text-right">
            <h4 className="text-lg font-medium">Somil</h4>
            <h2 className="text-xl font-semibold -mt-1 -mb-1">UP38 AB 9569</h2>
            <p className="text-sm text-gray-600">Maruti Suzuki Swift Dzire</p>
          </div>
        </div>
        <div className="flex items-center border-b-2 -mt-2 border-gray-200 gap-5 p-3 transition-all">
          <i className="text-lg ri-map-pin-2-fill"></i>
          <div className="">
            <h3 className="text-lg font-medium">562/11-A</h3>
            <p className="text-sm -mt-1 text-gray-600">
              Ram Ganga Vihar,Phase 2, Moradabad
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5 p-3 transition-all">
          <i className="text-lg ri-money-rupee-circle-fill"></i>
          <div className="">
            <h3 className="text-lg font-medium">₹193.20</h3>
            <p className="text-sm -mt-1 text-gray-600">Cash Cash</p>
          </div>
        </div>

        <button className="w-full mt-3 mb-5 bg-green-600  text-white font-semibold rounded-lg p-2">
          Make a Payment
        </button>
      </div>
    </div>
  );
};

export default Riding;
