import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import Markers from "./Markers";

import useSvgMap from "@/hooks/useSvgMap";

export default function WorldMap({ typedList, circleSize }) {
  const svgMap = useSvgMap();

  return (
    <div className="map-display">
      <TransformWrapper centerOnInit>
        <TransformComponent
          wrapperStyle={{
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          <div
            className="world-map"
            dangerouslySetInnerHTML={{ __html: svgMap }}
          />
          <div className="circles">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 800 385"
              xmlns="http://www.w3.org/2000/svg"
            >
              <Markers typedList={typedList} circleSize={circleSize} />
            </svg>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
