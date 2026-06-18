import { useEffect } from "react";
import { useState } from "react";
import { useTransformContext } from "react-zoom-pan-pinch";

export default function Markers({ typedList, circleSize }) {
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
