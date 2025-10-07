import Hero from "./components/Hero";
import Navbar from "./components/Navbar";

const Homepage = () => {
  return (
    <div className="relative scrollbar-hidden">
      <div className="fixed top-0 right-0 w-full">
        <Navbar />
      </div>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Hero />
      </div>
    </div>
  );
};

export default Homepage;
