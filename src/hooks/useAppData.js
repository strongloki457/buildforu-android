import { useContext } from "react";
import { AppDataContext } from "../contexts/AppDataContext";

export function useAppData() {
  return useContext(AppDataContext);
}
