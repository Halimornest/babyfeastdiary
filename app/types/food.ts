export type IngredientCategory = "KARBO" | "PROTEIN_HEWANI" | "PROTEIN_NABATI" | "SAYURAN" | "BUAH";

export interface IngredientItem {
  id: number;
  name: string;
  category: IngredientCategory;
}

export interface DataItem {
  id: number;
  name: string;
}

export type SeasoningCategory = "AROMATIC" | "SPICE" | "FAT" | "HERB";

export interface SeasoningItem extends DataItem {
  category?: SeasoningCategory;
  icon?: string;
  minAgeMonths?: number;
  isStrongFlavor?: boolean;
}

export interface SelectableChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  emoji?: string;
  disabled?: boolean;
}

export interface RadioCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  emoji?: string;
}
