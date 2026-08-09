import { useState, useRef } from "react";

import CityCount from "@/components/CityCount";
import CityInput from "@/components/CityInput";
import TypedCityList from "@/components/TypedCityList";
import WorldMap from "@/components/WorldMap";
import CircleSize from "@/components/CircleSize";

import { searchCities } from "@/api/cities";

function App() {
  const [typedList, setTypedList] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [size, setSize] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const queryText = nameInput.trim();
    if (!queryText || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await searchCities(queryText);
      const existingIds = new Set(typedList.map((c) => c.id));
      const newItems = result.filter((c) => !existingIds.has(c.id));

      if (newItems.length > 0) {
        setTypedList((prev) => [...prev, newItems[0]]);
        setNameInput("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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
        disabled={submitting}
      />
      {error && <p className="error">{error}</p>}
      <CityCount>{typedList.length}</CityCount>
      <TypedCityList typedList={typedList} containerRef={containerRef} />
    </>
  );
}

export default App;
