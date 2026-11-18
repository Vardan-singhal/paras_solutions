# Verification and remaining launch checks

Local verification completed on 18 November 2026.

## Passed

| Check               | Result                                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| Production build    | Next.js production compilation and route generation passed                                                      |
| Lint                | React hooks, JavaScript and JSX accessibility checks passed                                                     |
| Dependency audit    | Full dependency audit and production-only audit reported zero vulnerabilities                                   |
| Database/API tests  | Seven integration tests passed against an isolated, real MongoDB process                                        |
| Public route crawl  | 39 rendered pages returned successfully with headings and canonical metadata                                    |
| Internal navigation | 57 unique internal links, including category filters and product-preselected quote links, returned successfully |
| Assets              | All 62 supplied images appeared in rendered markup and their original and optimized URLs returned successfully  |
| Downloads           | The company profile PDF returned successfully; all 13 pages were rendered and visually inspected                |
| Missing content     | Unknown/draft product, industry, article and case-study paths returned actual HTTP 404 responses                |
| Compatibility URLs  | Old quotation, manufacturing, quality and duplex-product routes redirected permanently                          |
| SEO utilities       | Robots and dynamic XML sitemap returned successfully                                                            |
| Same-origin API     | Next.js API proxy and public calculator settings checked; internal rates were not exposed                       |
| Local startup       | The combined command starts a persistent local database/API and waits for health before starting the frontend   |

Two additional startup regression tests verify readiness waiting and actionable errors when the API is unreachable. Both root and direct frontend startup commands use this readiness gate. The database-backed sitemap is explicitly dynamic so production builds do not depend on a running API.

The seven backend test groups cover:

1. Public catalogue, pagination, search/category filters and draft exclusion.
2. Calculator option validation, invalid dimensions, internal-rate privacy and quotation mode.
3. Enquiry/calculator database persistence with missing SMTP configuration.
4. Idempotent quotation requests and denied unauthorised access to customer records.
5. Upload-session enforcement, true file signatures, size limits, session ownership and private retrieval.
6. Two-email SMTP delivery to an isolated local capture server and successful record retention when delivery fails.
7. Origin restrictions, injection rejection, safe response headers and submission rate limiting.

The deliberate email-failure case records a delivery-failure reference in test output. It is an expected assertion, not a failed test or a lost submission.

## Implemented layout and interaction changes

- Fixed the source counter restart problem by replacing animated numerical claims with stable, verified company highlights.
- Homepage slideshow advances every five seconds, has previous/next and slide selectors, and explicit pause/play. Reduced motion suppresses automatic movement unless the visitor explicitly starts it.
- Product dropdown is positioned against the full header container, constrained to its width and viewport height, and scrolls when necessary. Keyboard Escape returns focus to its disclosure button.
- Bootstrap breakpoints stack page, product, form, calculator and editorial layouts. Additional CSS covers 320/360/576/768/992/1200/1400-style layout ranges.
- Native dialogs provide focus containment/Escape handling; FAQ uses native disclosure elements. Content is visible when animation code is unavailable.
- Source documents, brand artwork and portrait images retain contained proportions rather than being cropped like product thumbnails.

## Verification limits

- The in-app browser reported no available browser. Consequently no desktop/mobile screenshots, real viewport measurements, interactive browser hydration/click checks, automated accessibility scan or Lighthouse/Core Web Vitals measurement were performed. Responsive code and HTTP checks are not represented as browser visual proof.
- Docker was unavailable in this environment. Container/Compose definitions were prepared but not built or run here.
- Production Atlas/MongoDB, SMTP, Cloudinary, a real domain and tracking credentials were not supplied. Local database and local SMTP tests do not verify external provider credentials or live email deliverability. Production uploads require configured Cloudinary; private development uploads were tested locally.
- No approved case-study content, testimonial permissions, certificate copies or pricing rate card was supplied. Those publication/data gaps remain explicit rather than being filled with fake claims.

Before public launch, run an actual viewport/keyboard/reduced-motion review, validate external service credentials, confirm current business information and review legal/retention arrangements. Use the commands and environment instructions in the README and deployment guide.
