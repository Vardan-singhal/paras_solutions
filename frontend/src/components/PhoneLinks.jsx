export default function PhoneLinks({ company, className = '' }) {
  const phones = company.phones || [{ number: company.phone, href: company.phoneHref }];
  return (
    <span className={`phone-links ${className}`}>
      {phones.map(({ number, href }) => (
        <a key={href} href={href}>
          {number}
        </a>
      ))}
    </span>
  );
}
