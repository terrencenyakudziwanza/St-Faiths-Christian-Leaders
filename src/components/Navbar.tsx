import React, { useState } from "react";

const Navbar: React.FC = () => {
  const [activeMenuItm, setActiveMenuItm] = useState(0);
  const menuItms = ["Discover", "Boards", "Create"];
  return (
    <div className="w-screen p-4 px-8 flex justify-between items-center fixed z-10 top-0 left-0">
      <p>Archer</p>
      <div className="flex gap-3 bg-[#EEE] rounded-xl p-1.5">
        {menuItms.map((m, i) => (
          <div
            key={i}
            className={`${activeMenuItm === i && ""} bg-transparent rounded-lg hover:bg-[#CCC] cursor-pointer p-1.5`}
            onClick={() => setActiveMenuItm(i)}
          >
            {m}
          </div>
        ))}
      </div>
      <button className="outline-none p-1.5 px-2.5 bg-black text-white rounded-xl flex gap-2">Login</button>
    </div>
  );
};

export default Navbar;
