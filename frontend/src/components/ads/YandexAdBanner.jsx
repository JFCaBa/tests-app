import React, { useEffect, useState } from "react";

const YandexAdBanner = ({ className }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize and platform detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Common breakpoint for mobile devices
    };

    // Check initially
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Initialize Yandex Context if not already initialized
    if (!window.yaContextCb) {
      window.yaContextCb = [];
    }

    // Push the render configuration with appropriate block ID based on platform
    window.yaContextCb.push(() => {
      Ya.Context.AdvManager.render({
        blockId: isMobile ? "R-A-13917587-1" : "R-A-13917587-2",
        type: "floorAd",
        platform: isMobile ? "touch" : "desktop",
      });
    });

    // Create and append the script tag if it doesn't exist
    if (
      !document.querySelector(
        'script[src="https://yandex.ru/ads/system/context.js"]'
      )
    ) {
      const script = document.createElement("script");
      script.src = "https://yandex.ru/ads/system/context.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // No cleanup needed for floorAd type as it's managed by Yandex
  }, [isMobile]); // Re-run effect when platform changes

  // The div will serve as a container for the floor ad
  return <div className={`yandex-rtb ${className || ""}`} />;
};

export default YandexAdBanner;
