import { useState } from "react";
import CityCount from "./components/CityCount";
import CityInput from "./components/CityInput";
import TypedCityList from "./components/TypedCityList";
import WorldMap from "./components/WorldMap";
import { useCityDB } from "./hooks/useCityDB";
import CircleSize from "./components/CircleSize";
import { useRef } from "react";

function App() {
  const [typedList, setTypedList] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [size, setSize] = useState(5);
  const containerRef = useRef(null);
  const { query } = useCityDB();

  function handleSubmit(e) {
    e.preventDefault();
    const result = query(
      "SELECT * FROM cities WHERE city = ? COLLATE NOCASE OR city_ascii = ? COLLATE NOCASE OR name_cn = ? COLLATE NOCASE LIMIT 50;",
      [nameInput, nameInput, nameInput],
    );
    const existingIds = new Set(typedList.map((c) => c.id));
    const newItems = result.filter((c) => !existingIds.has(c.id));

    if (newItems.length > 0) {
      setTypedList((prev) => [...prev, newItems[0]]);
      setNameInput("");
    }
  }

  return (
    <>
      <WorldMap typedList={typedList} circleSize={size} />
      <CircleSize value={size} setValue={setSize} />
      <CityInput
        handleSubmit={handleSubmit}
        nameInput={nameInput}
        setNameInput={setNameInput}
      />
      <CityCount>{typedList.length}</CityCount>
      <TypedCityList typedList={typedList} containerRef={containerRef} />
    </>
  );
}

export default App;
