export default function CityInput({ handleSubmit, nameInput, setNameInput }) {
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        className="city-input"
        value={nameInput}
        placeholder="请输入城市名..."
        onChange={(e) => {
          setNameInput(e.target.value);
        }}
      />
      <button type="submit" className="btn">
        确认
      </button>
    </form>
  );
}
