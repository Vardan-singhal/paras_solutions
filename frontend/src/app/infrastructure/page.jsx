import { content, metadata } from '@/lib/api';
import { PageHero, ContentBlocks, FAQ, CTA, SectionHeading } from '@/components/UI';
import Reveal from '@/components/Reveal';
import machines from '@/data/infrastructure-machines.json';
export async function generateMetadata() {
  const p = await content('/pages/infrastructure');
  return metadata('Infrastructure & Machinery', p.lead, '/infrastructure');
}
export default async function Infrastructure() {
  const p = await content('/pages/infrastructure');
  return (
    <>
      <PageHero {...p} crumbs={[{ label: 'Infrastructure' }]} />
      <section className="section">
        <div className="container">
          <ContentBlocks blocks={p.blocks} />
        </div>
      </section>
      <section className="section section--soft">
        <div className="container">
          <SectionHeading
            eyebrow="THE PUBLISHED EQUIPMENT PORTFOLIO"
            title="Printing, conversion and finishing."
            text="Equipment descriptions reproduced from the existing source. Contact the company to confirm current availability and project suitability."
          />
          <div className="row g-4">
            {machines.map((m, i) => (
              <div className="col-md-6" key={i}>
                <Reveal className="detail-panel h-100">
                  <p className="eyebrow">{String(i + 1).padStart(2, '0')}</p>
                  <h3>{m.name}</h3>
                  {m.size && (
                    <p className="mb-2">
                      <strong>Size:</strong> {m.size}
                    </p>
                  )}
                  {m.make && (
                    <p className="mb-0">
                      <strong>Make:</strong> {m.make}
                    </p>
                  )}
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="BEFORE YOUR VISIT" title="A closer look at the setup." />
          <FAQ items={p.faqs} />
        </div>
      </section>
      <CTA />
    </>
  );
}
