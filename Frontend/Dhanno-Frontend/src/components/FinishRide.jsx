import React from 'react'
import { Link } from 'react-router-dom'

const FinishRide = (props) => {
  return (
    <div>
             <h5 onClick={()=>{
                        props.setFinishRidePanel(false)
                     }} className="top-0 text-center w-[93%] absolute p-1"><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5> 
                    <h2 className="font-semibold text-xl ">Finish Ride</h2>

                    <div className="flex items-center justify-between w-full my-4 p-4 border-2 border-yellow-400 rounded-xl transition-all">
                         <div className="flex items-center gap-3">
                              <img className="h-12 w-12 rounded-full object-cover" src="https://thumbs.dreamstime.com/b/man-perfect-brilliant-smile-unshaven-face-defocused-background-guy-happy-emotional-expression-outdoors-bearded-man-124640934.jpg" alt="" />
                              <h2 className="text-lg font-medium">Karan Johar</h2>
                         </div>
                         <h5 className="text-lg font-semibold">2.2 KM</h5>
                    </div>
          
                    <div className='flex flex-col -mt-2 gap-2 justify-between items-center'>
          
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
                    <div className="mt-6 w-full">
                              <Link to="/captain/home" className='flex items-center justify-center text-lg w-full mt-5 bg-green-700 scale-100 text-white font-semibold rounded-lg p-3'>End Ride</Link>
   
                    </div>
                    </div>
    </div>
  )
}

export default FinishRide
