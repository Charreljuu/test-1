import { useLayoutEffect } from "react";

export default function TypedCityList({ typedList, containerRef, onSelect }) {
  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [typedList]);

  return (
    <ul className="typed-city-list" ref={containerRef}>
      {typedList.map((city) => (
        <li key={city.id} onClick={() => onSelect(city)}>
          <span className="admin">{city.country_cn}</span>
          <span className="admin">{city.admin_cn}</span>
          <span className="admin">{city.name_cn}</span>
        </li>
      ))}
    </ul>
  );
}
