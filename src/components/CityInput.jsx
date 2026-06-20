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
          setNameInput(e.target.value.toString());
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // 阻止回车默认提交表单（如果有 form 包裹的话）
            handleSubmit({ preventDefault: () => {} });
          }
        }}
      />
      <button type="button" className="btn" onClick={handleClick}>
        确认
      </button>
    </form>
  );
}
