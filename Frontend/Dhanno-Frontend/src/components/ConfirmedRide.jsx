import React from 'react'
import carLogo from "../assets/Car-Icon3.png";
import autoLogo from "../assets/auto-icon2.jpg"

const ConfirmedRide = (props) => {
  return (
    <div>
      <h5 onClick={()=>{
              props.setConfirmRidePanel(false)
              props.setVehiclePanel(true)
           }} className="top-0 text-center w-[93%] absolute p-1"><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5> 
          <h2 className="font-semibold text-xl ">Confirm your ride</h2>

          <div className='flex flex-col -mt-2 gap-2 justify-between items-center'>
               <img className='h-30 ' src={carLogo} alt='' />

          <div className='w-full mt-2'>
               <div className="flex items-center border-b-2 border-gray-200 mb-3 rounded-xl gap-5 p-3 transition-all">
                    <i className="text-lg ri-map-pin-user-fill"></i>
                    <div className="">
                         <h3 className="text-lg font-medium">562/11-A</h3>
                         <p className="text-sm -mt-1 text-gray-600">Ram Ganga Vihar,Phase 2, Moradabad</p>
                    </div>
               </div>
                <div className="flex items-center border-b-2 border-gray-200 gap-5 p-3 transition-all">
                    <i className="text-lg ri-map-pin-2-fill"></i>
                    <div className="">
                         <h3 className="text-lg font-medium">562/11-A</h3>
                         <p className="text-sm -mt-1 text-gray-600">Ram Ganga Vihar,Phase 2, Moradabad</p>
                    </div>
               </div>
                <div className="flex items-center mb-3 gap-5 p-3 transition-all">
                    <i className="text-lg ri-money-rupee-circle-fill"></i>
                    <div className="">
                         <h3 className="text-lg font-medium">₹193.20</h3>
                         <p className="text-sm -mt-1 text-gray-600">Cash Cash</p>
                    </div>
               </div>

          </div>
          <button onClick={()=>{
                 props.setLookingForDriverPanel(true)
                 props.setConfirmRidePanel(false)
          }} className='w-full mt-5 bg-green-700 scale-100 text-white font-semibold rounded-lg p-2'>Confirm</button>
          </div>
    </div>
  )
}

export default ConfirmedRide
