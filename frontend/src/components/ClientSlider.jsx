import ClientIdentity from './ClientIdentity';

export default function ClientSlider({ clients }) {
  if (!clients.length) return null;

  return (
    <div className="client-slider" role="region" aria-label="Client portfolio">
      <div className="client-slider__track" style={{ animationDuration: `${clients.length * 5}s` }}>
        {[0, 1].map((copy) => (
          <div
            className="client-slider__group"
            key={copy}
            aria-hidden={copy === 1 ? true : undefined}
          >
            {clients.map((client) => (
              <div className="client-slider__card" key={client.slug}>
                <ClientIdentity name={client.name} />
                <span>{client.sector}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
