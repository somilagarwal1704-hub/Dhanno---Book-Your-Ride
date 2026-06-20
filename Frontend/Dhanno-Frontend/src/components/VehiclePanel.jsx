// import React from "react";
// import carLogo from "../assets/Car-Icon3.png";
// import autoLogo from "../assets/auto-icon2.jpg"
// import axios from "axios";

// const VehiclePanel = ({
//   distance,
//   duration,
//   setConfirmRidePanel,
//   setVehiclePanel,
//   setSelectedVehicle,
//   setFare
// }) => {

// const handleSelect = (type) => {
//   setSelectedVehicle(type);

//   createRide(type);  

//   setVehiclePanel(false);
//   setConfirmRidePanel(true);
// }


//   return (
//     <div>

//      <h5 onClick={()=>{
//               setVehiclePanel(false)
//            }} className="top-0 text-center w-[93%] absolute p-1"><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5> 
//       <h2 className="font-semibold text-xl mb-5">Choose a ride</h2>

//       <div onClick={()=>{
//           handleSelect("car")
//       }} className="w-full border-2 border-gray-200 active:border-black mb-3 rounded-xl flex items-center justify-between p-3 transition-all">
//         <img className="h-15 " src={carLogo} alt="Car Logo" />
//         <div className="ml-3  w-1/2">
//           <h4 className="font-medium text-base">
//             Car{" "}
//             <span>
//               <i className="ri-user-3-fill"></i>4
//             </span>
//           </h4>
//           <h5 className="font-medium text-sm">{props.duration} mins away</h5>
//           <p className="font-normal text-xs">Affordable, compact rides</p>
//         </div>
//         <h2 className="font-medium">₹{fares.car.toFixed(0)}</h2>
//       </div>

//       <div onClick={()=>{
//           handleSelect("bike")
//       }} className="w-full border-2 border-gray-200 active:border-black mb-3 rounded-xl flex items-center justify-between p-3 transition-all">
//         <img
//           className="h-15 "
//           src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=552/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy85NTM4NTEyZC1mZGUxLTRmNzMtYmQ1MS05Y2VmZjRlMjU0ZjEucG5n"
//           alt="Bike Logo"
//         />
//         <div className="ml-3  w-1/2">
//           <h4 className="font-medium text-base">
//             Moto{" "}
//             <span>
//               <i className="ri-user-3-fill"></i>1
//             </span>
//           </h4>
//           <h5 className="font-medium text-sm">{props.duration} mins away</h5>
//           <p className="font-normal text-xs">Affordable motorcycle ride</p>
//         </div>
//         <h2 className="font-medium">₹{fares.bike.toFixed(0)}</h2>
//       </div>

//       <div onClick={()=>{
//           handleSelect("auto")
//       }} className="w-full border-2 border-gray-200 active:border-black mb-3 rounded-xl flex items-center justify-between p-3 transition-all">
//         <img className="h-15 " src={autoLogo} alt="Auto Logo" />
//         <div className=" ml-3 w-1/2">
//           <h4 className="font-medium text-base">
//             Auto{" "}
//             <span>
//               <i className="ri-user-3-fill"></i>3
//             </span>
//           </h4>
//           <h5 className="font-medium text-sm">{props.duration} mins away</h5>
//           <p className="font-normal text-xs">Affordable auto rides</p>
//         </div>
//         <h2 className="font-medium">₹{fares.auto.toFixed(0)}</h2>
//       </div>
//     </div>
//   );
// };

// export default VehiclePanel;


import React from "react";
import carLogo from "../assets/Car-Icon3.png";
import autoLogo from "../assets/auto-icon2.jpg";

const VehiclePanel = ({
  distance,
  duration,
  setConfirmRidePanel,
  setVehiclePanel,
  setSelectedVehicle,
  setFare,
  createRide
}) => {

  const handleSelect = (type) => {
    setSelectedVehicle(type);
   
  };

  return (
    <div>
      <h5
        onClick={() => setVehiclePanel(false)}
        className="top-0 text-center w-[93%] absolute p-1"
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>

      <h2 className="font-semibold text-xl mb-5">Choose a ride</h2>

      {/* CAR */}
      <div
        onClick={() => handleSelect("car")}
        className="border p-3 rounded-xl flex justify-between items-center mb-3"
      >
        <img className="h-12" src={carLogo} />

        <div className="w-1/2">
          <h4>Car</h4>
          <p>{duration} mins</p>
        </div>

        <h2>Calculating...</h2>
      </div>

      {/* BIKE */}
      <div onClick={() => handleSelect("bike")} className="border p-3 rounded-xl flex justify-between items-center mb-3">
        <img className="h-12" src="https://cdn-icons-png.flaticon.com/512/2972/2972185.png" />

        <div className="w-1/2">
          <h4>Bike</h4>
          <p>{duration} mins</p>
        </div>

        <h2>Calculating...</h2>
      </div>

      {/* AUTO */}
      <div onClick={() => handleSelect("auto")} className="border p-3 rounded-xl flex justify-between items-center">
        <img className="h-12" src={autoLogo} />

        <div className="w-1/2">
          <h4>Auto</h4>
          <p>{duration} mins</p>
        </div>

        <h2>Calculating...</h2>
      </div>
    </div>
  );
};

export default VehiclePanel;