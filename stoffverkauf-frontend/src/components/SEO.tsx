import { Helmet } from "react-helmet-async";
import { useSettings } from "@/lib/settings-context";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article" | "product";
  image?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const BASE_URL = "https://www.stoffverkauf-weber.de";
const DEFAULT_IMAGE = "https://www.stoffverkauf-weber.de/og-image.jpg";

const SEO = ({
  title,
  description,
  path = "/",
  type = "website",
  image,
  noIndex = false,
  jsonLd,
}: SEOProps) => {
  const { settings } = useSettings();
  const siteName = settings.general.storeName || "Stoffverkauf Weber";
  const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
  const url = `${BASE_URL}${path}`;
  const ogImage = image || DEFAULT_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="de_DE" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
