// Mock data for orders, reviews, blog posts

export interface Order {
  id: string;
  date: string;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  items: { name: string; quantity: number; price: number; image: string }[];
  total: number;
  trackingNumber?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  verified: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  content: string;
  contentEn: string;
  image: string;
  date: string;
  category: string;
  categoryEn: string;
  readTime: number;
}

export const mockOrders: Order[] = [
  {
    id: "ORD-2026-001",
    date: "2026-02-10",
    status: "delivered",
    items: [
      { name: "Schurwolle Flanell Mittelblau", quantity: 3, price: 79.90, image: "" },
      { name: "Flanell Stretch", quantity: 2, price: 79.90, image: "" },
    ],
    total: 399.50,
    trackingNumber: "DE4839201847",
  },
  {
    id: "ORD-2026-002",
    date: "2026-02-14",
    status: "shipped",
    items: [
      { name: "Premium Schurwolle Flanell", quantity: 1, price: 99.90, image: "" },
    ],
    total: 99.90,
    trackingNumber: "DE9182736450",
  },
  {
    id: "ORD-2026-003",
    date: "2026-02-16",
    status: "processing",
    items: [
      { name: "Pailletten Walkstoff", quantity: 4, price: 59.90, image: "" },
      { name: "Designer Mantelstoff", quantity: 1, price: 69.90, image: "" },
    ],
    total: 309.50,
  },
];

export const mockReviews: Record<string, Review[]> = {
  "1": [
    { id: "r1", author: "Maria S.", rating: 5, date: "2026-01-20", text: "Wunderschöner Stoff, genau wie beschrieben. Die Qualität ist hervorragend!", verified: true },
    { id: "r2", author: "Thomas K.", rating: 5, date: "2026-01-15", text: "Perfekt für meinen Maßanzug. Sehr zufrieden.", verified: true },
    { id: "r3", author: "Anna B.", rating: 4, date: "2025-12-28", text: "Tolle Qualität, Lieferung war schnell. Ein Stern Abzug wegen leicht abweichender Farbe.", verified: false },
  ],
  "2": [
    { id: "r4", author: "Klaus M.", rating: 5, date: "2026-02-01", text: "Italienische Qualität spürt man sofort. Sehr weicher Griff.", verified: true },
    { id: "r5", author: "Petra W.", rating: 4, date: "2026-01-10", text: "Schöner Flanell, lässt sich gut verarbeiten.", verified: true },
  ],
};

export const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Flanell richtig verarbeiten: Tipps vom Profi",
    titleEn: "How to Work with Flannel: Pro Tips",
    excerpt: "Lernen Sie die besten Techniken zur Verarbeitung von Flanell für perfekte Ergebnisse.",
    excerptEn: "Learn the best techniques for working with flannel for perfect results.",
    content: "Flanell ist einer der beliebtesten Stoffe für elegante Kleidung. In diesem Artikel zeigen wir Ihnen Schritt für Schritt, wie Sie Flanell richtig zuschneiden, nähen und pflegen.\n\n## Zuschnitt\nAchten Sie auf die Strichrichtung des Flanells. Streichen Sie mit der Hand über den Stoff — die glatte Richtung ist die Strichrichtung.\n\n## Nähen\nVerwenden Sie eine Universalnadel der Stärke 80 und einen normalen Geradstich. Eine Stichlänge von 2,5-3mm ist ideal.\n\n## Bügeln\nBügeln Sie Flanell immer von der linken Seite mit einem Bügeltuch.",
    contentEn: "Flannel is one of the most popular fabrics for elegant clothing. In this article, we show you step by step how to properly cut, sew, and care for flannel.\n\n## Cutting\nPay attention to the nap direction of the flannel. Run your hand over the fabric — the smooth direction is the nap direction.\n\n## Sewing\nUse a universal needle size 80 and a normal straight stitch. A stitch length of 2.5-3mm is ideal.\n\n## Ironing\nAlways iron flannel from the wrong side with a pressing cloth.",
    image: "",
    date: "2026-02-10",
    category: "Tipps & Tricks",
    categoryEn: "Tips & Tricks",
    readTime: 5,
  },
  {
    id: "2",
    title: "Trendfarben Frühling 2026: Welche Stoffe passen?",
    titleEn: "Spring 2026 Trend Colors: Which Fabrics Match?",
    excerpt: "Die angesagtesten Farben der Saison und welche Stoffarten sich dafür eignen.",
    excerptEn: "The hottest colors of the season and which fabric types suit them.",
    content: "Der Frühling 2026 bringt wunderbare Farbtöne mit sich. Von zartem Lavendel bis kräftigem Terrakotta — wir zeigen Ihnen die perfekten Stoffkombinationen.\n\n## Lavendel & Flieder\nBesonders schön in leichten Viskose-Stoffen und feinem Jersey.\n\n## Terrakotta & Rost\nPerfekt für Leinenstoffe und schwere Baumwolle.\n\n## Salbeigrün\nEin vielseitiger Ton, der in Seide und Crepe besonders edel wirkt.",
    contentEn: "Spring 2026 brings wonderful color tones. From delicate lavender to bold terracotta — we show you the perfect fabric combinations.\n\n## Lavender & Lilac\nParticularly beautiful in light viscose fabrics and fine jersey.\n\n## Terracotta & Rust\nPerfect for linen fabrics and heavy cotton.\n\n## Sage Green\nA versatile tone that looks particularly elegant in silk and crepe.",
    image: "",
    date: "2026-02-05",
    category: "Trends",
    categoryEn: "Trends",
    readTime: 4,
  },
  {
    id: "3",
    title: "Stoffpflege: So bleiben Ihre Stoffe lange schön",
    titleEn: "Fabric Care: How to Keep Your Fabrics Beautiful",
    excerpt: "Die wichtigsten Pflegetipps für verschiedene Stoffarten.",
    excerptEn: "The most important care tips for different fabric types.",
    content: "Richtige Pflege verlängert die Lebensdauer Ihrer Stoffe erheblich. Hier sind unsere bewährten Tipps.\n\n## Wolle & Schurwolle\nImmer kalt waschen oder chemisch reinigen lassen. Nie im Trockner trocknen.\n\n## Seide\nHandwäsche bei maximal 30°C. Nicht auswringen, sondern in ein Handtuch einrollen.\n\n## Baumwolle\nKann bei 40-60°C gewaschen werden. Auf links drehen für weniger Pilling.",
    contentEn: "Proper care significantly extends the life of your fabrics. Here are our proven tips.\n\n## Wool & Virgin Wool\nAlways wash cold or have dry cleaned. Never tumble dry.\n\n## Silk\nHand wash at maximum 30°C. Don't wring, but roll in a towel.\n\n## Cotton\nCan be washed at 40-60°C. Turn inside out for less pilling.",
    image: "",
    date: "2026-01-28",
    category: "Pflege",
    categoryEn: "Care",
    readTime: 3,
  },
];
