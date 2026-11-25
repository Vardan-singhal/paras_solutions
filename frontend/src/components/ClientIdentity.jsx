import Image from 'next/image';

const clientLogos = {
  'STURLITE ELECTRIC PVT. LTD.': 'Sturlite.webp',
  'MODERN TRANSFORMERS PVT. LTD.': 'Modern Transformers.webp',
  'BILLTECH ELECTRICALS PVT. LTD.': 'Billtech.webp',
  'M.K. ELECTRONICS': 'MK Electronics.webp',
  'OUSHI LIGHTING PVT. LTD.': 'Oushi Lighting.webp',
  'GLOW GREEN ENERGY LTD.': 'Glow Green.webp',
  'BANSAL MOULDERS PVT. LTD.': 'Bansal Moulders.webp',
  'SMD LED & EMS PVT. LTD.': 'SMD LED.webp',
  'S.V. ELECTRONICS': 'SV Electronics.webp',
  'VISHESH PACKAGING': 'Vishesh Packaging.webp',
  'MYSORE HOME APPLIANCES': 'Mysore home.webp',
  'TANYA INDUSTRIES': 'tanya.webp',
  'APRA LED LIGHTING': 'Apra.webp',
  'JAI SATYA LIGHTINGS': 'Jai satya.webp',
  'TOSA ENERGY PVT. LTD.': 'Tosa.webp',
  'SS ELECTRONICS': 'ss electronics.webp',
  'LUXX 99 LIGHTING PVT. LTD.': 'luxx 99.webp',
};

export default function ClientIdentity({ name }) {
  const logo = clientLogos[name];

  if (!logo) return <strong>{name}</strong>;

  return (
    <span className="client-logo">
      <Image
        src={`/assets/Client%20Logos/${encodeURIComponent(logo)}`}
        alt={name}
        fill
        sizes="220px"
      />
    </span>
  );
}
