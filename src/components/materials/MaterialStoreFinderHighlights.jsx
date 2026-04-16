import { BadgeEuro, MapPinned, Zap } from "lucide-react";
import Card from "../ui/Card";
import { useI18n } from "../../hooks/useI18n";
import { getStoreProductName } from "../../utils/localizedValue";
import { formatStoreDistance, formatStorePrice } from "./materialStoreUtils";

export default function MaterialStoreFinderHighlights({ cards, locale }) {
  const { t } = useI18n();

  const iconMap = {
    cheapest: BadgeEuro,
    fastest: Zap,
    nearest: MapPinned
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = iconMap[card.key] ?? BadgeEuro;

        return (
          <Card key={card.key} className="bg-white/80">
            <div className="flex items-start gap-4">
              <div className="rounded-[20px] bg-brand-50 p-3 text-brand-700">
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-400">{card.title}</p>
                <p className="mt-2 text-lg text-slate-900">
                  {card.store ? getStoreProductName(t, card.store) : t("materials.noFinderMatch", "No matching option")}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {card.store
                    ? `${card.store.storeName} | ${formatStorePrice(card.store.price, locale)} | ${formatStoreDistance(card.store.distance, locale)}`
                    : t("materials.adjustFinderFilters", "Adjust the search or filters to compare stores.")}
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  {card.store ? card.detail : t("materials.finderMockHint", "Mock buying options ready for future integrations.")}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
