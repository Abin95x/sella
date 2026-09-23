export type Swatch = { name: string; hex: string; panel: string };

export type Product = {
  id: "arc" | "flow";
  name: string;
  price: number;
  tagline: string;
  blurb: string;
  quote: { text: string; author: string };
  features: { title: string; body: string }[];
  specs: [string, string][];
  swatches: Swatch[];
};

export const products: Product[] = [
  {
    id: "arc",
    name: "Sella Arc",
    price: 289,
    tagline: "“Light enough to carry with one finger”",
    blurb:
      "Arc is the everyday chair that goes where the day goes — from the breakfast bench to the balcony to the extra seat at a crowded table.",
    quote: {
      text: "Picked up four for our tiny flat. They stack in a corner and come out every weekend.",
      author: "Priya R.",
    },
    features: [
      {
        title: "Featherweight",
        body: "A glass-filled bio-polymer frame keeps Arc under 3 kg while carrying 150 kg without a creak.",
      },
      {
        title: "Stacks eight high",
        body: "Nested legs and a tapered back let eight chairs stack in less space than a floor lamp.",
      },
      {
        title: "Soft where it counts",
        body: "The curved back rail flexes a few millimetres as you lean, so it feels upholstered without the foam.",
      },
    ],
    specs: [
      ["Weight", "2.8 kg"],
      ["Seat height", "46 cm"],
      ["Materials", "Bio-polymer, 38% plant based"],
      ["Warranty", "6 years"],
    ],
    swatches: [
      { name: "Sunflower", hex: "#f0cf36", panel: "#e7e3dc" },
      { name: "Tomato", hex: "#e0573a", panel: "#ecd8cd" },
      { name: "Lilac", hex: "#b3a4e6", panel: "#e2def0" },
      { name: "Olive", hex: "#7f8c52", panel: "#dfe1d2" },
      { name: "Chalk", hex: "#efece6", panel: "#d7d1c7" },
    ],
  },
  {
    id: "flow",
    name: "Sella Flow",
    price: 420,
    tagline: "“Built for people who fidget”",
    blurb:
      "Flow's perforated shell tilts and twists with you. It is the chair for long dinners, late deadlines and everything that happens in between.",
    quote: {
      text: "I switched my desk chair for Flow three months ago. My back has stopped complaining.",
      author: "Tomás V.",
    },
    features: [
      {
        title: "Moves with you",
        body: "A flexible shell and pivoting base let you rock, perch or lean back without ever feeling unstable.",
      },
      {
        title: "Breathes",
        body: "Over 1,400 laser-cut perforations keep air moving so you stay cool through summer dinners.",
      },
      {
        title: "Made from waste",
        body: "The shell is moulded from regenerated nylon recovered from discarded nets and carpets.",
      },
    ],
    specs: [
      ["Weight", "4.6 kg"],
      ["Seat height", "45 cm"],
      ["Materials", "Regenerated nylon, powder-coated steel"],
      ["Warranty", "8 years"],
    ],
    swatches: [
      { name: "Ink", hex: "#262626", panel: "#cdbfae" },
      { name: "Chalk", hex: "#ebe7df", panel: "#c9c3b8" },
      { name: "Sage", hex: "#95a386", panel: "#d6d9cb" },
      { name: "Clay", hex: "#c47a56", panel: "#e5d3c4" },
    ],
  },
];

export const stats = [
  { label: "Recovered materials", value: 97, suffix: "%", note: "of every Flow shell" },
  { label: "Solar powered studio", value: 88, suffix: "%", note: "renewable energy used" },
  { label: "Built to be kept", value: 8, suffix: " yrs", note: "longest warranty we offer" },
];

export const stories = [
  {
    name: "@marta.builds",
    rating: 5,
    text: "Assembly took five minutes and zero swearing. The Olive Arc looks like a little sculpture next to our oak table.",
  },
  {
    name: "@june_and_co",
    rating: 5,
    text: "We run a small café and swapped every chair for Flow. Customers stay longer and nobody asks for cushions anymore.",
  },
  {
    name: "@dev.on.a.chair",
    rating: 4,
    text: "Working from the kitchen used to wreck my shoulders. Flow keeps me moving without looking like office furniture.",
  },
  {
    name: "@thehollandhome",
    rating: 5,
    text: "Bought two to test, ended up with ten. They stack in the hallway cupboard and come out for every birthday.",
  },
  {
    name: "@kofi.m",
    rating: 5,
    text: "The Tomato colour is ridiculous in the best way. Guests always ask where it is from.",
  },
];

export const quiz = [
  {
    q: "What will the chair mostly be used for?",
    options: ["Working long hours", "Dinners and gatherings", "Lounging around", "A bit of everything"],
  },
  {
    q: "How often will you move it around?",
    options: ["Every day", "Every week", "Rarely", "It never leaves its spot"],
  },
  {
    q: "How do you usually sit?",
    options: ["Upright and still", "Cross-legged", "Leaning back", "Constantly shifting"],
  },
  {
    q: "Which palette suits your space?",
    options: ["Bright and playful", "Earthy and soft", "Dark and graphic", "Light and airy"],
  },
];

export const faqs = [
  {
    q: "How long does delivery take?",
    a: "Most orders ship within three working days and arrive flat-packed in a fully recyclable box. Assembly takes about five minutes with the tool in the box.",
  },
  {
    q: "Can I use the chairs outdoors?",
    a: "Arc is UV-stabilised and happy on a covered deck or balcony. Flow's steel base is powder-coated but we recommend bringing it inside over winter.",
  },
  {
    q: "What if it doesn't suit my space?",
    a: "You have 60 days to live with it. If it isn't right, we'll collect it free of charge and refurbish it for someone else.",
  },
  {
    q: "What happens at the end of a chair's life?",
    a: "Send it back and we'll grind the shell into feedstock for new chairs. Every part is labelled so it can be separated and recycled.",
  },
  {
    q: "Do you offer trade pricing?",
    a: "Yes — cafés, studios and schools ordering ten or more chairs get tiered pricing and a dedicated contact.",
  },
];

export const tiles = [
  { color: "#f0cf36", chair: "arc" as const, tone: "#2e2d2b" },
  { color: "#b3a4e6", chair: "flow" as const, tone: "#262626" },
  { color: "#e3c48f", chair: "arc" as const, tone: "#e0573a" },
  { color: "#7f8c52", chair: "flow" as const, tone: "#ebe7df" },
  { color: "#ecd8cd", chair: "arc" as const, tone: "#b3a4e6" },
  { color: "#e0573a", chair: "flow" as const, tone: "#f0cf36" },
  { color: "#cdbfae", chair: "arc" as const, tone: "#262626" },
  { color: "#95a386", chair: "flow" as const, tone: "#262626" },
];
