import { Construction, MapPin, ShoppingCart, Zap } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";

const UPCOMING = [
  { icon: MapPin, key: "nearbyStores" },
  { icon: ShoppingCart, key: "priceComparison" },
  { icon: Zap, key: "oneClickOrder" }
];

export default function MaterialsStoreFinderTab() {
  const { t } = useI18n();

  return (
    <div className="rounded-[28px] border border-dashed border-brand-200 bg-gradient-to-br from-brand-50/60 to-white/80 px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
        <Construction size={26} />
      </div>
      <h3 className="mt-5 text-xl text-slate-900">
        {t("materials.storeFinderComingSoon", "Store Finder — coming soon")}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
        {t(
          "materials.storeFinderComingSoonDesc",
          "We're building a real-time tool to find building supply stores near your job site, compare prices and order directly from the app."
        )}
      </p>

      <div className="mx-auto mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
        {UPCOMING.map(({ icon: Icon, key }) => (
          <div key={key} className="rounded-2xl border border-white/70 bg-white/70 px-4 py-4 text-left">
            <Icon size={16} className="text-brand-600" />
            <p className="mt-3 text-sm text-slate-800">
              {t(`materials.storeFeature.${key}`, key)}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-slate-400">
        {t("materials.storeFinderEta", "Expected in v0.2 — use the Requests tab in the meantime.")}
      </p>
    </div>
  );
}
