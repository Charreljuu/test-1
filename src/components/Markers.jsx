import { useEffect } from "react";
import { useState } from "react";
import { useControls } from "react-zoom-pan-pinch";

export default function Markers({ typedList, circleSize, focus }) {
  const [tooltip, setTooltip] = useState(null);
  const { instance, state, setTransform } = useControls();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const unsub = instance.onChange((ref) => {
      setScale(ref.instance.state.scale);
    });
    return unsub;
  }, [instance]);

  useEffect(() => {
    if (!focus?.city) return;
    const content = instance.contentComponent;
    const wrapper = instance.wrapperComponent;
    if (!content || !wrapper || state.scale === 0) return;

    const marker = content.querySelector(`[data-marker="${focus.city.id}"]`);
    if (!marker) return;

    const contentRect = content.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const x = (markerRect.left - contentRect.left) / state.scale;
    const y = (markerRect.top - contentRect.top) / state.scale;
    const focusScale = 8;

    setTransform(
      wrapperRect.width / 2 - focusScale * x,
      wrapperRect.height / 2 - focusScale * y,
      focusScale,
      600,
      "easeOut",
    );
  }, [focus, instance]);

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
            data-marker={city.id}
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
