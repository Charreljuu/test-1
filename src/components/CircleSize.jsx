export default function CircleSize({ value, setValue }) {
  return (
    <div className="circle-size">
      <label>圆圈大小：</label>
      <input
        type="range"
        min="0.5"
        max="10"
        step="0.5"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
    </div>
  );
}
