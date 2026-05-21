import RealStoreMap from "../marketMap/RealStoreMap";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import { useI18n } from "../../hooks/useI18n";

export default function MaterialStoreFinderMap({ stores, userLocation, selectedStore, onSelectStore }) {
  const { t } = useI18n();

  return (
    <Card className="overflow-hidden">
      <SectionHeader
        title={t("materials.finderMapTitle", "Mapa sklepów")}
        subtitle={t("materials.finderMapSubtitle", "Sklepy budowlane w Twojej okolicy")}
      />
      <p className="mb-2 text-xs text-slate-400">
        Stores shown on the map are real locations. Prices and availability are not real-time.
      </p>
      <RealStoreMap
        stores={stores}
        userLocation={userLocation}
        selectedStore={selectedStore}
        onSelectStore={onSelectStore}
        height="380px"
      />
    </Card>
  );
}
