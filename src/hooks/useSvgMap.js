import { useState, useEffect } from "react";

export default function useSvgMap() {
  const [svgMap, setSvgMap] = useState("");

  useEffect(() => {
    const fetchSvgMap = async () => {
      try {
        const response = await fetch("/worldmap.svg");
        const svgContent = await response.text();
        setSvgMap(svgContent);
      } catch (error) {
        console.error("Failed to load SVG map:", error);
      }
    };

    fetchSvgMap();
  }, []);

  return svgMap;
}
