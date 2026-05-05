import { useState } from "react";
import svgText from "../assets/worldmap.svg?raw";

export default function useSvgMap() {
  const [svgMap, _setSvgMap] = useState(svgText);

  return svgMap;
}
