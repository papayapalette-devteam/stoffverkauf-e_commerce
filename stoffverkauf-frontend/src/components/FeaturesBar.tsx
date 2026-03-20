import { Truck, Globe, Scissors, Headphones } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const FeaturesBar = () => {
  const { t } = useI18n();

  const features = [
    { icon: Truck, label: t("feat.shipping"), desc: t("feat.shipping.desc") },
    { icon: Globe, label: t("feat.payment"), desc: t("feat.payment.desc") },
    { icon: Scissors, label: t("feat.samples"), desc: t("feat.samples.desc") },
    { icon: Headphones, label: t("feat.support"), desc: t("feat.support.desc") },
  ];

  return (
    <section className="border-y border-border bg-secondary/50">
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-accent/10">
                <f.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-body font-semibold text-sm text-foreground">{f.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBar;
