import './MustangCatalog.css';

export default function MustangCatalog({ mustangs, selectedCar, onSelect }) {
  return (
    <div className="mustang-catalog">
      <h2 className="catalog-header">SELECT MODEL</h2>
      <div className="catalog-list">
        {mustangs.map((car) => (
          <button
            key={car.id}
            className={`catalog-item ${selectedCar.id === car.id ? 'is-selected' : ''}`}
            onClick={() => onSelect(car)}
            aria-pressed={selectedCar.id === car.id}
          >
            <div className="catalog-item-image">
              <img src={car.images.side} alt={car.name} loading="lazy" />
            </div>
            <div className="catalog-item-info">
              <span className="catalog-item-year">{car.year}</span>
              <h3 className="catalog-item-name">{car.name}</h3>
              <span className="catalog-item-trim">{car.trim}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
