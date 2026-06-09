import { useState, useEffect } from "react";
import {
  TransformWrapper,
  TransformComponent,
  useTransformContext,
} from "react-zoom-pan-pinch";
import useSvgMap from "../hooks/useSvgMap";

function Markers({ typedList, circleSize }) {
  const [tooltip, setTooltip] = useState(null);
  const ctx = useTransformContext();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const unsub = ctx.onChange((ref) => {
      setScale(ref.instance.state.scale);
    });
    return unsub;
  }, [ctx]);

  function handleMarkerEnter(e, name, cx, cy) {
    if (!e.target.closest("svg")) return;
    setTooltip({ text: name, x: cx, y: cy });
  }

  function handleMarkerLeave() {
    setTooltip(null);
  }

  return (
    <g>
      {typedList.map((city) => {
        const cx = (city.lon / 360) * 800 * 0.997 + 400;
        const cy = 385 - (city.lat / 180) * 385 * 1.035 - 200;
        return (
          <circle
            key={city.id}
            cx={cx}
            cy={cy}
            r={circleSize}
            pointerEvents="auto"
            onMouseEnter={(e) => handleMarkerEnter(e, city.name_cn, cx, cy)}
            onMouseLeave={handleMarkerLeave}
          />
        );
      })}
      {tooltip && (
        <text
          x={tooltip.x + 1 + 1.5 * Number(circleSize)}
          y={tooltip.y}
          fontSize={`${16 / scale}px`}
          stroke="white"
          strokeWidth={`${2 / scale}px`}
          paintOrder="stroke fill"
        >
          {tooltip.text}
        </text>
      )}
    </g>
  );
}

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
