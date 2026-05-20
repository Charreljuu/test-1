export default function CityCount({ children }) {
  return (
    <div className="city-count">
      已输入<span className="typed-count">{children}</span>个城市
    </div>
  );
}
