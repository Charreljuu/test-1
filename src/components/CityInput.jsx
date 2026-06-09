export default function CityInput({ handleSubmit, nameInput, setNameInput }) {
  function handleClick() {
    handleSubmit({ preventDefault: () => {} });
  }

  return (
    <form className="city-form">
      <input
        type="text"
        className="city-input"
        value={nameInput}
        placeholder="请输入城市名..."
        onChange={(e) => {
          setNameInput(e.target.value);
        }}
        onKeyDown={(e) => {
          e.preventDefault();
          handleSubmit({ preventDefault: () => {} });
        }}
      />
      <button type="button" className="btn" onClick={handleClick}>
        确认
      </button>
    </form>
  );
}
