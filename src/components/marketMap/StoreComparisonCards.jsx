import Card from "../ui/Card";
import { useI18n } from "../../hooks/useI18n";
import { getStoreProductName } from "../../utils/localizedValue";

export default function StoreComparisonCards({ cards }) {
  const { t } = useI18n();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="bg-white/80">
            <div className="flex items-start gap-4">
              <div className="rounded-[20px] bg-brand-50 p-3 text-brand-700">
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-400">{card.title}</p>
                <p className="mt-2 truncate text-lg text-slate-900">
                  {card.store ? getStoreProductName(t, card.store) : t("marketMap.noOption")}
                </p>
                <p className="mt-1 text-sm text-slate-500">{card.detail}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
