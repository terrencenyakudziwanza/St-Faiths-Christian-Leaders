import React, { useState } from "react";

import login from '../assets/icons/log-in.svg'

const Navbar: React.FC = () => {
  const [activeMenuItm, setActiveMenuItm] = useState(0);
  const menuItms = ["Discover", "Boards", "Create"];  
  
  return (
    <div className="w-full p-4 px-8 flex justify-between items-center fixed z-10 top-0 left-0 bg-[rgba(255,255,255,.2)">
      <p className="text-white text-3xl">Archer</p>
      <div className="flex gap-3 bg-[#EEE] rounded-[500px] p-1.5">
        {menuItms.map((m, i) => (
          <div
            key={i}
            className={`${activeMenuItm === i && ""} bg-transparent rounded-[inherit] hover:bg-[#CCC] cursor-pointer p-1.5`}
            onClick={() => setActiveMenuItm(i)}
          >
            {m}
          </div>
        ))}
      </div>
      <button className="outline-none h-full p-3 px-5 bg-black text-white rounded-[500px] flex items-center gap-2">
        <img src={login} className="icon" alt="" />
        <p>Login</p>
      </button>
    </div>
  );
};

export default Navbar;
