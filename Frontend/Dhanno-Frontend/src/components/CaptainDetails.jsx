import React from 'react'

const CaptainDetails = () => {
  return (
    <div>
        <div className="flex items-center justify-between mt-2">
              <div className="flex items-center justify-start gap-4">
                    <img className="h-10 w-10 rounded-full object-cover" src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" alt=" " />
                    <h4 className="text-lg font-medium">Harshita Patel</h4>
              </div>
              <div>
                    <h4 className="text-lg font-semibold">₹295.20</h4>
                    <p className="text-sm text-gray-600">Earned</p>
              </div>
        </div>

        <div className="flex p-3 bg-gray-100 rounded-xl items-start justify-center gap-5 mt-6">
              <div className="text-center">
                    <i className="text-3xl mb-2 font-thin ri-timer-2-line"></i>
                    <h5 className="text-lg font-medium">10.2</h5>
                    <p className="text-sm text-gray-600">Hours Online</p>
              </div>

              <div className="text-center">
                    <i className="text-3xl mb-2 font-thin ri-speed-up-line"></i>
                    <h5 className="text-lg font-medium">85km/h</h5>
                    <p  className="text-sm text-gray-600">Average Speed</p>
              </div>

              <div className="text-center">
                    <i className="text-3xl mb-2 font-thin ri-booklet-line"></i>
                    <h5 className="text-lg font-medium">12</h5>
                    <p className="text-sm text-gray-600">Rides Completed</p>
              </div>
        </div>
    </div>
  )
}

export default CaptainDetails
