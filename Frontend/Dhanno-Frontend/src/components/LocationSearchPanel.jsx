import React from "react";

const LocationSearchPanel = (props) => {
  const locations = [
    "Ram Ganga Vihar,Phase 2, Moradabad",
    "Government Polytechnic, Moradabad",
    "Moradabad Railway Station",
    "Hanuman Mandir, Moradabad",
  ];
  return (
    <div>
      {locations.map(function(elem,idx) {
        return<div key={idx} onClick={()=>{
        props.setVehiclePanel(true),
        props.setPanelOpen(false)
        }
      }
         className="flex items-center my-2 justify-start gap-4 border-2 border-gray-100 active:border-black rounded-xl p-3 transition-all cursor-pointer" >
          <h2 className="bg-[#dfdfe6] h-10 w-10 shrink-0 flex items-center justify-center rounded-full">
            <i className="ri-map-pin-fill"></i>
          </h2>
          <h4 className="font-medium">{elem}</h4>
        </div>;
      })}
    </div>
  );
};

export default LocationSearchPanel;
