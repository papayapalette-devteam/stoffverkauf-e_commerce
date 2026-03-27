import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings-context";

const Footer = () => {
  const { t, lang } = useI18n();
  const { settings } = useSettings();

  const linkGroups = [
    {
      title: t("footer.products"),
      links: [
        { label: t("footer.stoffe"), to: "/#stoffe" },
        { label: t("footer.kategorien"), to: "/#kategorien" },
        { label: t("footer.bestseller"), to: "/#bestseller" },
        { label: t("footer.angebote"), to: "/#angebote" },
      ],
    },
    {
      title: t("footer.about"),
      links: [
        { label: t("footer.ueberuns"), to: "/about" },
        { label: t("footer.kontakt"), to: "/contact" },
        { label: t("footer.naehkurse"), to: "/blog" },
        { label: t("footer.stoffkiste"), to: "/#shop" },
      ],
    },
    {
      title: t("footer.service"),
      links: [
        { label: t("footer.versand"), to: "/shipping" },
        { label: t("footer.stoffmuster"), to: "/samples" },
        { label: t("footer.rueckgabe"), to: "/returns" },
        { label: t("footer.faq"), to: "/faq" },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { label: t("footer.agb"), to: "/agb" },
        { label: t("footer.impressum"), to: "/impressum" },
        { label: t("footer.datenschutz"), to: "/datenschutz" },
        { label: lang === "de" ? "Widerrufsbelehrung" : "Cancellation Policy", to: "/widerruf" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-display text-xl font-bold text-foreground">
              {settings.general.storeName || "Stoffverkauf Weber"}
            </Link>
            <p className="text-sm text-muted-foreground mt-3 font-body leading-relaxed">
              {t("footer.desc")}
            </p>
            <p className="text-xs text-muted-foreground mt-3 font-body">
              {settings.general.phone && <>Tel: {settings.general.phone}<br /></>}
              {settings.general.email && <>{settings.general.email}</>}
            </p>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="font-body font-semibold text-sm text-foreground mb-4">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.to.includes('#') ? (
                      <a
                        href={link.to}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-body">
            © {new Date().getFullYear()} {settings.general.storeName || "Stoffverkauf Weber"}. {t("footer.rights")}
          </p>
          <div className="flex gap-6">
            {["Facebook", "Instagram"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
