import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center h-20 px-10">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-maroon">Fotoboothgaksi</h2>
        <span className="text-[1px]"> Created by Suka Kopi Manis ☕</span>
      </div>
      <Button className="bg-maroon" asChild>
        <Link to={"/capture"}>Try it Now 📸</Link>
      </Button>
    </div>
  );
};

export default Navbar;
