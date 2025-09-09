import { useState, useEffect } from "react";

import { Button } from '@/components/ui/button';
import NavigationBar from '@/mycomponents/NavigationBar'
import Footer from "@/mycomponents/Footer";

const backgroundImages = [
  "/img/pexels-pixabay-207891.jpg",
  "/img/pexels-magda-ehlers-1319572.jpg",
  "/img/pexels-markus-spiske-168866.jpg",
]

const Homepage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  return (
    <div className='bg-gradient-to-br from-blue-50 to-indigo-100'>
      <NavigationBar />
      <div
        className="w-[100%] [height:min(710px,100vh)] flex overflow-hidden pt-[80px] bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${backgroundImages[currentIndex]})` }}
      >
        <div className='flex'>
          <div className='my-auto w-[80%] lg:w-[90%] pl-[10%]'>
            {/* <h1 className='text-3xl lg:text-5xl mb-8 leading-[1.2] text-white'>Understand Developmental Differences Through Eye Gaze</h1>
            <p className='mb-8 text-white text-sm lg:text-md xl:text-base'>Our advanced AI analyzes natural eye movements to offer early insights into social communication patterns — empowering families and clinicians with accessible, non-invasive screening.</p> */}
            <h1 className='text-3xl lg:text-5xl mb-8 leading-[1.2] text-white'>Empower Your Learning Journey</h1>
            <p className='mb-8 text-white text-sm lg:text-md xl:text-base'>All the essential tools and resources you need to study smarter, stay organized, and succeed..</p>
            <div className='flex'>
              <Button className="bg-blue-600 mr-4 hover:bg-blue-700">
                <a href="#works">Get Started</a>
              </Button>
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                  Know more
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Homepage