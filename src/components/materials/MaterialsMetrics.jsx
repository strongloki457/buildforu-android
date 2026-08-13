import { ClipboardList, PackageCheck, PackagePlus, ShoppingCart } from "lucide-react";
import { useMemo } from "react";
import MetricCard from "../ui/MetricCard";
import { useI18n } from "../../hooks/useI18n";

export default function MaterialsMetrics({ isAdmin, scopedRequests }) {
  const { t } = useI18n();

  const pendingCount = useMemo(
    () => scopedRequests.filter((request) => String(request.status).toLowerCase() === "pending").length,
    [scopedRequests]
  );
  const orderedCount = useMemo(
    () => scopedRequests.filter((request) => String(request.status).toLowerCase() === "ordered").length,
    [scopedRequests]
  );
  const purchasedCount = useMemo(
    () => scopedRequests.filter((request) => String(request.status).toLowerCase() === "purchased").length,
    [scopedRequests]
  );

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <MetricCard
        icon={ClipboardList}
        label={isAdmin ? t("materials.requestsVisible", "All requests") : t("materials.requestsVisible", "My requests")}
        value={scopedRequests.length}
        detail={t(
          "materials.requestsVisibleDetail",
          isAdmin ? "Every request submitted by field teams." : "Your submitted material requests."
        )}
      />
      <MetricCard
        icon={PackagePlus}
        label={t("materials.pendingRequests", "Pending")}
        value={pendingCount}
        detail={t("materials.pendingRequestsDetail", "Waiting for admin review or purchasing action.")}
      />
      <MetricCard
        icon={ShoppingCart}
        label={t("materials.orderedRequests", "Ordered")}
        value={orderedCount}
        detail={t("materials.orderedRequestsDetail", "Already sent to suppliers or stores.")}
      />
      <MetricCard
        icon={PackageCheck}
        label={t("materials.purchasedRequests", "Purchased")}
        value={purchasedCount}
        detail={t("materials.purchasedRequestsDetail", "Ready to reach the crew or site.")}
      />
    </div>
  );
}
