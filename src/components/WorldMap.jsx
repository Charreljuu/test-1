import { useState, useRef, useEffect, useCallback } from "react";
import useSvgMap from "../hooks/useSvgMap";

export default function WorldMap({ typedList, circleSize }) {
  const svgMap = useSvgMap();

  const [tooltip, setTooltip] = useState(null);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  /**
   * 根据容器和地图尺寸，约束平移量，确保地图始终覆盖容器
   */
  const clampTranslate = useCallback((tx, ty, scl) => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return { tx, ty };

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    const mapW = 800 * scl;
    const mapH = 385 * scl;
    const layoutX = content.offsetLeft;
    const layoutY = content.offsetTop;

    let clampedX = tx;
    let clampedY = ty;

    // X 轴约束
    if (mapW <= containerW) {
      // 地图较小，必须完全在容器内
      const minX = -layoutX; // 左边缘 = 0
      const maxX = containerW - layoutX - mapW; // 右边缘 = containerW
      clampedX = Math.min(maxX, Math.max(minX, tx));
    } else {
      // 地图比容器大，必须覆盖容器
      const maxX = -layoutX; // 左边缘 ≤ 0
      const minX = containerW - layoutX - mapW; // 右边缘 ≥ containerW
      clampedX = Math.min(maxX, Math.max(minX, tx));
    }

    // Y 轴约束
    if (mapH <= containerH) {
      const minY = -layoutY;
      const maxY = containerH - layoutY - mapH;
      clampedY = Math.min(maxY, Math.max(minY, ty));
    } else {
      const maxY = -layoutY;
      const minY = containerH - layoutY - mapH;
      clampedY = Math.min(maxY, Math.max(minY, ty));
    }

    return { tx: clampedX, ty: clampedY };
  }, []);

  // 缩放处理（以鼠标位置为中心，并受边界约束）
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const layoutX = content.offsetLeft;
      const layoutY = content.offsetTop;
      const currentScale = scale; // 从 state 获取当前缩放

      // 鼠标所在的地图原始坐标
      const worldX = (mouseX - layoutX - translateX) / currentScale;
      const worldY = (mouseY - layoutY - translateY) / currentScale;

      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(Math.max(currentScale * factor, 0.75), 8);

      // 计算理想平移（保持鼠标点不动）
      const desiredTX = mouseX - layoutX - worldX * newScale;
      const desiredTY = mouseY - layoutY - worldY * newScale;

      // 边界约束
      const clamped = clampTranslate(desiredTX, desiredTY, newScale);

      // 如果约束后的平移值与理想值不同，鼠标点会稍稍偏移，这是可接受的
      setScale(newScale);
      setTranslateX(clamped.tx);
      setTranslateY(clamped.ty);
    },
    [scale, translateX, translateY, clampTranslate],
  );

  // 拖拽开始
  const handleMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        tx: translateX,
        ty: translateY,
      };
    },
    [translateX, translateY],
  );

  // 拖拽移动（应用边界约束）
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const newTX = dragStart.current.tx + dx;
      const newTY = dragStart.current.ty + dy;
      const clamped = clampTranslate(newTX, newTY, scale);
      setTranslateX(clamped.tx);
      setTranslateY(clamped.ty);
    },
    [isDragging, scale, clampTranslate],
  );

  // 拖拽结束
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 绑定全局拖拽事件
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 绑定滚轮事件
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  // 拖拽时阻止文本选中
  useEffect(() => {
    const preventSelect = (e) => {
      if (isDragging) e.preventDefault();
    };
    document.addEventListener("selectstart", preventSelect);
    return () => document.removeEventListener("selectstart", preventSelect);
  }, [isDragging]);

  // 初始化时确保状态满足边界约束
  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (container && content) {
      const clamped = clampTranslate(translateX, translateY, scale);
      if (clamped.tx !== translateX || clamped.ty !== translateY) {
        setTranslateX(clamped.tx);
        setTranslateY(clamped.ty);
      }
    }
    // 仅在挂载时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMarkerEnter(e, name, cx, cy) {
    if (!e.target.closest("svg")) return;
    setTooltip({ text: name, x: cx, y: cy });
  }

  function handleMarkerLeave() {
    setTooltip(null);
  }

  return (
    <div className="map-display">
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          ref={contentRef}
          style={{
            position: "relative",
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            transformOrigin: "0 0",
            width: "800px",
            height: "385px",
          }}
        >
          <div
            className="world-map"
            dangerouslySetInnerHTML={{ __html: svgMap }}
          />
          <div className="circles">
            <svg
              width="800"
              height="385"
              viewBox="0 0 800 385"
              xmlns="http://www.w3.org/2000/svg"
            >
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
                      onMouseEnter={(e) =>
                        handleMarkerEnter(e, city.name_cn, cx, cy)
                      }
                      onMouseLeave={handleMarkerLeave}
                    />
                  );
                })}
                {tooltip && (
                  <text
                    x={tooltip.x + 3 + Number(circleSize)}
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
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
