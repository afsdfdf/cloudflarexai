import React from "react";
import Image from "next/image";

// This component provides a logo that will work consistently across the app
export default function LogoBase64({ 
  width = 32, 
  height = 32, 
  className = "" 
}: { 
  width?: number; 
  height?: number; 
  className?: string;
}) {
  return (
    <Image
      src="/logo.png"
      alt="XAI Finance Logo"
      width={width}
      height={height}
      className={className}
      style={{
        display: "block",
        borderRadius: "50%",
        objectFit: "cover"
      }}
    />
  );
} 