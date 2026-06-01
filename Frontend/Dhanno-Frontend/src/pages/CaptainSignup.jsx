import React, { useState } from "react";
import logo from "../assets/logo4.png";
import { Link } from "react-router-dom";
import  {CaptainDataContext}  from "../context/CaptainContext.jsx";
import {useNavigate} from "react-router-dom";
import axios from "axios";

const CaptainSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  const { captain, setCaptain } = React.useContext(CaptainDataContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    const CaptainData= {
 
      fullname: {
        firstname: firstname,
        lastname: lastname,
      },
      email: email,
      password: password,
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: vehicleCapacity,
        vehicleType: vehicleType,
      }
    };

   try{
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`,CaptainData)

    if(response.status===201){
      const data = response.data
      setCaptain(data.captain)
      localStorage.setItem("token",data.token)
      navigate("/captain/home")
    }
   }catch(error){
    console.error("Error registering captain:", error);
   }

    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setVehicleColor("");
    setVehiclePlate("");
    setVehicleCapacity("");
    setVehicleType("");
  };
  return (
    <div className="p-7 h-screen flex flex-col justify-between">
      <div>
        <img className="w-30 mb-5 " src={logo} alt="logo" />
        <form
          onSubmit={(e) => {
            submitHandler(e);
          }}
        >
          <h3 className="text-lg font-medium mb-2">
            What's our Captain's name
          </h3>
          <div className="flex gap-4 mb-6">
            <input
              className="bg-[#eeeeee] w-1/2 rounded px-4 py-2 border text-lg placeholder:text-base"
              required
              type="text"
              value={firstname}
              onChange={(e) => {
                setFirstName(e.target.value);
              }}
              placeholder="First name"
            />
            <input
              className="bg-[#eeeeee] w-1/2 rounded px-4 py-2 border text-lg placeholder:text-base"
              required
              type="text"
              value={lastname}
              onChange={(e) => {
                setLastName(e.target.value);
              }}
              placeholder="Last name"
            />
          </div>
          <h3 className="text-lg font-medium mb-2">
            What's our Captain's email
          </h3>
          <input
            className="bg-[#eeeeee] mb-6 rounded px-4 py-2 border text-lg placeholder:text-base"
            required
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="email@example.com"
          />
          <h3 className="text-lg font-medium mb-2">Enter Password</h3>
          <input
            className="bg-[#eeeeee] mb-6 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
            required
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder="password"
          />

          <h3 className="text-lg font-medium mb-2">Vehicle Information</h3>

          <div className="flex gap-4 mb-7">
            <input
              required
              className="bg-[#eeeeee] mb-6 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
              type="text"
              placeholder="Vehicle Color"
              value={vehicleColor}
              onChange={(e) => {
                setVehicleColor(e.target.value);
              }}
            />

            <input
              required
              className="bg-[#eeeeee] mb-6 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
              type="text"
              placeholder="Vehicle Plate"
              value={vehiclePlate}
              onChange={(e) => {
                setVehiclePlate(e.target.value);
              }}
            />
          </div>
          <div className="flex gap-4 mb-7">
            <input
              required
              className="bg-[#eeeeee] mb-6 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
              type="number"
              placeholder="Vehicle Capacity"
              value={vehicleCapacity}
              onChange={(e) => {
                setVehicleCapacity(e.target.value);
              }}
            />

            <select
              required
              className="bg-[#eeeeee] mb-6 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
              value={vehicleType}
              onChange={(e) => {
                setVehicleType(e.target.value);
              }}
            >
              <option value="" disabled>
                Select Vehicle Type
              </option>
              <option value="car">Car</option>
              <option value="bike">Moto</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <button className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 w-full text-lg placeholder:text-base">
            Create Captain Account
          </button>
        </form>
        <p className="text-center">
          Already have a account?{" "}
          <Link to="/captain/login" className="text-blue-600">
            Login here
          </Link>
        </p>
      </div>
      <div>
        <p className="text-[12px] mt-6 leading-tight">
          This site is protected by reCAPTCHA and the{" "}
          <span className="underline">Google Privacy Policy</span> and{" "}
          <span
            className="
       underline"
          >
            Terms of Service apply
          </span>
          .
        </p>
      </div>
    </div>
  );
};

export default CaptainSignup;
