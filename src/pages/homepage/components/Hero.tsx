import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import cat from "/src/assets/img/cat.png";
import iuv from "/src/assets/img/iuv.png";
import ofd from "/src/assets/img/ofd.png";

const Hero = () => {
  const images: string[] = [cat, iuv, ofd];

  return (
    <div className="flex flex-col items-center px-10 pt-30 gap-5 w-full scrollbar-hidden">
      <div className="flex flex-col gap-5 md:w-[600px] text-center">
        <div className="text-5xl md:text-6xl font-bold text-maroon">
          Take Photos, Choose a Theme, Get Your Photostrip Instantly!
        </div>
        <div className="text-maroon">
          No apps, no hassle. Just open this sh*t, snap photos with your camera,
          pick your favorite theme & colors, and your photostrip is ready to
          save or print.
        </div>
      </div>
      <Button className="bg-maroon" asChild>
        <Link to={"/capture"}>Try it Now 📸</Link>
      </Button>
      <div className="w-full max-w-5xl mx-auto py-10">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={20}
          slidesPerView={3}
          loop={true}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
        >
          {images.map((image, idx) => {
            return (
              <SwiperSlide key={idx + 1}>
                <img
                  src={image}
                  alt={`slide-${idx}`}
                  className="w-full h-60 object-cover rounded-xl shadow-lg"
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default Hero;
