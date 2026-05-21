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
