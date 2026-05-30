import React, { useState } from "react";
import logo from "../assets/logo4.png";
import { Link,useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext.jsx";


const UserSignup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstname,setFirstName]=useState("");
    const [lastname,setLastName]= useState("");
    const [userData,setUserData]=useState([])

    const navigate = useNavigate()
    const {user,setUser}=React.useContext(UserDataContext)


    const submitHandler=async (e)=>{
      e.preventDefault()
     const newUser={
      fullname:{
        firstname:firstname,
        lastname:lastname
      },
      email:email,
      password:password
     }
     console.log(newUser)

     const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/register`,newUser)

     if(response.status===201){
      const data = response.data
      setUser(data.user)
      localStorage.setItem("token",data.token)
      navigate("/home")
     }
      setFirstName("")
      setLastName("")
      setEmail("")
      setPassword("")
    }
  return (
     <div className="p-7 h-screen flex flex-col justify-between">
      <div>
        <img className="w-30 mb-5 " src={logo} alt="logo" />
        <form onSubmit={(e)=>{
            submitHandler(e)}}  >

           <h3 className="text-base font-medium mb-2">What's your name</h3> 
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
          <h3 className="text-base font-medium mb-2">What's your email</h3>
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
          <button className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 w-full text-lg placeholder:text-base">
            Create account
          </button>
        </form>
        <p className="text-center">
          Already have a account?{" "}
          <Link to="/user/login" className="text-blue-600">
            Login here
          </Link>
        </p>
      </div>
      <div>
       <p className="text-[12px] leading-tight">This site is protected by reCAPTCHA and the <span className="underline">Google Privacy Policy</span>  and <span className="
       underline">Terms of Service apply</span>.</p>
      </div>
    </div>
  )
}

export default UserSignup
