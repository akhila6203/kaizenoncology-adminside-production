// field builders
const T = (key, label, placeholder, o = {}) => ({ key, label, type: 'text', placeholder, ...o });
const A = (key, label, placeholder, o = {}) => ({ key, label, type: 'textarea', placeholder, ...o });
const S = (key, label, placeholder, o = {}) => ({ key, label, type: 'strings', placeholder, ...o });
const I = (key, label) => ({ key, label, type: 'image' });
const TECHS = (key, label) => ({ key, label, type: 'techs' });
const C = (key, label, itemLabel, fields) => ({ key, label, itemLabel, type: 'cards', fields });
const G = (key, label, fields) => ({ key, label, type: 'group', fields });

// heading that is auto-filled with its placeholder when left empty
const H = (placeholder) => T('heading', 'Heading', placeholder, { fill: true });
const PARAS = (label = 'Paragraphs') => S('paragraphs', label, '', { textarea: true });
const QA = () => C('items', 'Questions', 'FAQ', [T('question', 'Question'), A('answer', 'Answer')]);
const TITLE_DESC = (key, label, itemLabel) =>
  C(key, label, itemLabel, [T('title', 'Title'), A('description', 'Description')]);

/* ---------------- listing pages (Cancer Types, Screening, Treatments) ---------------- */
const listing = ({ introHeading, eyebrow, heading }) => [
  T('intro_heading', 'Intro heading', introHeading),
  G('understanding', '"Understanding the condition" block (image + info cards)', [
    H('Understanding the Condition'),
    PARAS(),
    I('image', 'Image'),
    T('badge_title', 'Image badge title', 'Knowledge matters'),
    T('badge_subtitle', 'Image badge subtitle', 'Understand your health'),
    TITLE_DESC('cards', 'Info cards', 'Info card'),
  ]),
  G('explore', 'Cards section heading (the cards come from the "Service pages" tab)', [
    T('eyebrow', 'Small label above the heading', eyebrow, { fill: true }),
    H(heading),
    A('subtitle', 'Subtitle'),
  ]),
];

/* ---------------- detail page: cancer type (e.g. Breast Cancer) ---------------- */
const CONDITION_PAGE = [
  G('hero', 'Top of page extras', [
    T('eyebrow', 'Small tag above the title', 'Cancer type'),
    A('paragraph2', 'Intro paragraph 2'),
    T('badge_title', 'Image badge title', 'Individual care matters'),
    T('badge_subtitle', 'Image badge subtitle', 'Every diagnosis is different'),
  ]),
  G('overview', 'Overview', [H((n) => `Overview of ${n}`), PARAS()]),
  G('about', 'What is it?', [H((n) => `What Is ${n}?`), PARAS()]),
  G('symptoms', 'Signs & Symptoms', [
    H((n) => `What Are the Signs and Symptoms of ${n}?`),
    A('intro', 'Intro text'),
    S('bullets', 'Symptoms (checklist)'),
  ]),
  G('diagnosis', 'Diagnosis', [
    H((n) => `How Is ${n} Diagnosed?`),
    A('intro', 'Intro text'),
    C('cards', 'Steps (numbered)', 'Step', [
      T('title', 'Title'),
      A('description', 'Description'),
      S('bullets', 'Bullet points (optional)'),
    ]),
  ]),
  G('technologies', 'Related Technologies', [
    H((n) => `Technologies Related to ${n}`),
    A('intro', 'Intro text'),
    TECHS('tech_ids', 'Related technologies'),
  ]),
  G('treatments', 'Treatment Options', [
    H((n) => `How Is ${n} Treated?`),
    A('intro', 'Intro text'),
    C('cards', 'Treatment cards', 'Card', [
      T('title', 'Title'),
      A('description', 'Description'),
      S('bullets', 'Bullet points (optional)'),
    ]),
  ]),
  G('risks', 'Risk Factors', [H((n) => `Risk Factors for ${n}`), S('bullets', 'Risk factors')]),
  G('prevention', 'Prevention', [H((n) => `Can ${n} Be Prevented?`), PARAS()]),
  G('faqs', 'FAQs', [H((n) => `Frequently Asked Questions About ${n}`), A('intro', 'Intro text'), QA()]),
  G('note', 'Closing card', [T('title', 'Title', 'Your Cancer Care Journey', { fill: true }), A('text', 'Text')]),
];

/* ---------------- detail page: screening test or treatment (3D Mammography, Cancer Surgery) ---------------- */
const article = ({ eyebrow }) => [
  G('hero', 'Top of page extras', [
    T('eyebrow', 'Small tag above the title', eyebrow),
    A('paragraph2', 'Intro paragraph 2'),
  ]),
  G('overview', 'Overview (first block under the top)', [H((n) => `Understanding ${n}`), PARAS()]),
  C('sections', 'Numbered sections (01, 02, 03 …)', 'Section', [
    T('heading', 'Heading', 'e.g. How does it work?'),
    PARAS(),
    S('bullets', 'Bullet chips (optional)'),
  ]),
  G('faqs', 'FAQs', [H('Frequently asked questions'), QA()]),
  G('note', 'Care note (bottom card)', [T('title', 'Title', 'A note about your care', { fill: true }), A('text', 'Text')]),
];

/* ---------------- Second Opinion ---------------- */
const SECOND_OPINION = [
  G('hero', 'Top of the page (top section not seen, adjust if needed)', [
    T('eyebrow', 'Small tag above the title', 'Cancer second opinion'),
    T('heading', 'Page title', 'Cancer Second Opinion'),
  ]),
  G('what', 'What is a second opinion (2 cards)', [
    T('eyebrow', 'Small label', 'Understanding your options', { fill: true }),
    H('What Is a Cancer Second Opinion?'),
    A('subtitle', 'Subtitle'),
    TITLE_DESC('cards', 'Cards', 'Card'),
  ]),
  G('review', 'What our specialists review (6 cards)', [
    T('eyebrow', 'Small label', 'Comprehensive review', { fill: true }),
    H('What Our Specialists Review'),
    A('subtitle', 'Subtitle'),
    TITLE_DESC('cards', 'Cards', 'Card'),
  ]),
  G('spotlight', 'Spotlight (e.g. Breast Cancer Second Opinion)', [
    T('eyebrow', 'Small label', 'Breast cancer care'),
    H('Breast Cancer Second Opinion'),
    PARAS(),
    T('button_text', 'Button text', 'Explore Breast Cancer Care'),
    T('button_link', 'Button link', '/services/cancer/breast-cancer'),
    T('box_title', 'Checklist box title', 'What May Be Reviewed?', { fill: true }),
    S('box_bullets', 'Checklist items'),
  ]),
  G('process', 'Process steps (01, 02, 03, 04)', [
    T('eyebrow', 'Small label', 'Your journey', { fill: true }),
    H('How the Second Opinion Process Works'),
    A('subtitle', 'Subtitle'),
    TITLE_DESC('steps', 'Steps', 'Step'),
  ]),
  G('documents', 'Reports and documents to share', [
    T('eyebrow', 'Small label', 'Before your consultation', { fill: true }),
    H('Reports and Documents to Share'),
    A('subtitle', 'Subtitle'),
    T('list_title', 'List title', 'Helpful Medical Records', { fill: true }),
    S('items', 'Documents'),
    A('note', 'Note under the list'),
  ]),
  G('treatments', 'Established vs modern treatments', [
    T('eyebrow', 'Small label', 'Treatment discussions', { fill: true }),
    H('Modern & Emerging Cancer Treatments'),
    A('subtitle', 'Subtitle'),
    C('columns', 'Two columns', 'Column', [
      T('tag', 'Small tag', 'Treatments used in appropriate clinical settings'),
      T('title', 'Title'),
      A('description', 'Description'),
      S('bullets', 'Bullet points'),
    ]),
    T('notice_title', 'Notice title', 'Important Information About Emerging Therapies', { fill: true }),
    A('notice_text', 'Notice text'),
  ]),
  G('faqs', 'FAQs', [
    T('eyebrow', 'Small label', 'Common questions', { fill: true }),
    H('Frequently Asked Questions'),
    A('subtitle', 'Subtitle'),
    QA(),
  ]),
];

/* ---------------- the four services ---------------- */
export const SERVICE_TYPES = {
  'cancer-types': {
    name: 'Cancer Types',
    urlBase: 'cancer', // detail pages live at /services/cancer/<slug>
    hasPages: true,
    pageLabel: 'Cancer type',
    serviceFields: listing({ introHeading: 'What is Cancer?', eyebrow: 'Explore by condition', heading: 'Find Care by Cancer Type' }),
    pageFields: CONDITION_PAGE,
  },
  'screening-diagnostics': {
    name: 'Screening & Diagnostics',
    urlBase: 'screening-diagnostics',
    hasPages: true,
    pageLabel: 'Screening / test',
    serviceFields: listing({ introHeading: 'Screening & Diagnostics', eyebrow: 'Explore by test', heading: 'Find the Right Screening or Test' }),
    pageFields: article({ eyebrow: 'Advanced breast imaging' }),
  },
  treatments: {
    name: 'Cancer Treatments',
    urlBase: 'treatments',
    hasPages: true,
    pageLabel: 'Treatment',
    serviceFields: listing({ introHeading: 'Cancer Treatments', eyebrow: 'Explore by treatment', heading: 'Find the Right Treatment' }),
    pageFields: article({ eyebrow: 'Surgical oncology' }),
  },
  'second-opinion': {
    name: 'Second Opinion',
    urlBase: 'second-opinion',
    hasPages: false,
    serviceFields: SECOND_OPINION,
    pageFields: [],
  },
};

export const SERVICE_OPTIONS = Object.entries(SERVICE_TYPES).map(([slug, t], i) => ({
  slug,
  name: t.name,
  sort_order: i + 1,
}));