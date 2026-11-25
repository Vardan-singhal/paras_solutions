import Image from 'next/image';

const clientLogos = {
  'STURLITE ELECTRIC PVT. LTD.': 'Sturlite.png',
  'MODERN TRANSFORMERS PVT. LTD.': 'Modern Transformers.png',
  'BILLTECH ELECTRICALS PVT. LTD.': 'Billtech.png',
  'M.K. ELECTRONICS': 'MK Electronics.png',
  'OUSHI LIGHTING PVT. LTD.': 'Oushi Lighting.png',
  'GLOW GREEN ENERGY LTD.': 'Glow Green.png',
  'BANSAL MOULDERS PVT. LTD.': 'Bansal Moulders.png',
  'SMD LED & EMS PVT. LTD.': 'SMD LED.png',
  'S.V. ELECTRONICS': 'SV Electronics.png',
  'VISHESH PACKAGING': 'Vishesh Packaging.png',
  'MYSORE HOME APPLIANCES': 'Mysore home.png',
  'TANYA INDUSTRIES': 'tanya.png',
  'APRA LED LIGHTING': 'Apra.png',
  'JAI SATYA LIGHTINGS': 'Jai satya.png',
  'TOSA ENERGY PVT. LTD.': 'Tosa.png',
  'SS ELECTRONICS': 'ss electronics.png',
  'LUXX 99 LIGHTING PVT. LTD.': 'luxx 99.png',
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
