import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { Classification } from "@/lib/types";

interface ClassificationBadgeProps extends Omit<BadgeProps, "variant" | "children"> {
  classification: Classification;
  showLabel?: boolean;
}

const classificationMap: Record<
  Classification,
  { variant: BadgeProps["variant"]; label: string }
> = {
  A: { variant: "destructive", label: "A - Mais Valiosos" },
  B: { variant: "accent", label: "B - Valor Intermediário" },
  C: { variant: "success", label: "C - Menos Valiosos" },
};

export function ClassificationBadge({ classification, showLabel = false, ...props }: ClassificationBadgeProps) {
  const { variant, label } = classificationMap[classification];
  return (
    <Badge variant={variant} {...props}>
      {showLabel ? label : classification}
    </Badge>
  );
}
