import { Boxes, Package, Truck } from "lucide-react";
import Card from "../components/ui/Card";
import MetricCard from "../components/ui/MetricCard";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

export default function MaterialsPage() {
  const { materials } = useAppData();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Boxes} label="Tracked items" value={materials.length} detail="Core materials monitored in the prototype." />
        <MetricCard icon={Package} label="In stock" value="2" detail="Adequate inventory for immediate tasks." />
        <MetricCard icon={Truck} label="Supplier sync" value="Live" detail="Procurement status is visually mocked." />
      </div>
      <Card>
        <SectionHeader title={t("materials.title")} subtitle={t("materials.subtitle")} />
        <div className="grid gap-4 lg:grid-cols-3">
          {materials.map((material) => (
            <div key={material.id} className="rounded-[28px] bg-white/80 p-5">
              <p className="text-lg text-slate-900">{material.name}</p>
              <p className="mt-2 text-sm text-slate-500">{material.supplier}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm text-slate-500">{material.stock}</span>
                <StatusBadge value={material.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
