import React from 'react'
import carLogo from "../assets/Car-Icon3.png";

const WaitingForDriverPanel = (props) => {
  return (
    <div>
            <h5 onClick={()=>{
                    props.setLookingForDriverPanel(true)
                    props.setWaitingForDriverPanel(false)
                 }} className="top-0 text-center w-[93%] absolute p-1"><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5> 
              
              <div className="flex items-center justify-between w-full mb-5 p-3 transition-all">
                     <img className='h-18 ' src={carLogo} alt='' />
                     <div className="text-right">
                         <h4 className="text-lg font-medium">Somil</h4>
                         <h2 className="text-xl font-semibold -mt-1 -mb-1">UP38 AB 9569</h2>
                         <p className="text-sm text-gray-600">Maruti Suzuki Swift Dzire</p>
                     </div>
              </div>
      
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
                </div>
          
  )
}

export default WaitingForDriverPanel
