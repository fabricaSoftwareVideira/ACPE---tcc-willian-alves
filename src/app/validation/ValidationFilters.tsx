import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface FiltersProps {
  filters: any;
  handleFilterChange: (field: string, value: any) => void;
  removeFilter: (key: string) => void;
  clearAllFilters: () => void;
  filterDisplayNames: Record<string, string>;
  statuses: Record<string, string>;
}

const ValidationFilters: React.FC<FiltersProps> = ({
  filters,
  handleFilterChange,
  removeFilter,
  clearAllFilters,
  filterDisplayNames,
  statuses,
}) => {
  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-4 bg-slate-900 p-4 rounded-sm">
        <Select
          onValueChange={(value) => handleFilterChange("status", value)}
          value={filters.status}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="approved">Aprovado</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="rejected">Rejeitado</SelectItem>
            <SelectItem value="archived">Arquivado</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Descrição"
          value={filters.description}
          onChange={(e) => handleFilterChange("description", e.target.value)}
        />
        <Input
          type="text"
          placeholder="Nome do aluno"
          value={filters.user}
          onChange={(e) => handleFilterChange("user", e.target.value)}
        />
        <Input
          type="date"
          placeholder="Data de envio"
          value={filters.createdAt}
          onChange={(e) => handleFilterChange("createdAt", e.target.value)}
        />
        <Input
          placeholder="Carga Horária"
          value={filters.workload}
          onChange={(e) => handleFilterChange("workload", e.target.value)}
        />

<div className="flex items-center gap-3">
        <Checkbox id="includeArchived" checked={filters.includeArchived} onCheckedChange={value => handleFilterChange("includeArchived", value as boolean)} />
        <Label htmlFor="includeArchived">Incluir arquivados</Label>
      </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2 justify-start items-center">
        {(Object.keys(filters) as (keyof typeof filters)[]).map((key) => {
          const keyStr = String(key);
          if (
            filters[key] &&
            (keyStr !== "status" || filters["status"] !== "all")
          ) {
            return (
              <Badge
                key={keyStr}
                variant="secondary"
                className="flex items-center text-xs font-medium p-3 h-4"
              >
                <span>
                  {`
                  ${filterDisplayNames[keyStr] || keyStr}: 
                  ${
                    keyStr === "createdAt"
                      ? filters[keyStr].split("-").reverse().join("/")
                      : typeof filters[keyStr] === "string"
                        ? statuses[filters[keyStr]] || filters[keyStr]
                        : filters[keyStr] ? "Sim" : "Não"
                  }
                `}
                </span>
                <button
                  onClick={() => removeFilter(keyStr)}
                  className="text-white ml-3"
                >
                  ✕
                </button>
              </Badge>
            );
          }
          return null;
        })}
        {Object.keys(filters).some(
          (key) =>
            filters[key as keyof typeof filters] &&
            (String(key) !== "status" || filters["status"] !== "all")
        ) && (
          <Button
            onClick={clearAllFilters}
            className="badge text-xs font-medium ml-5 p-3 h-4 rounded-full"
            variant={"destructive"}
          >
            Remover todos
          </Button>
        )}
      </div>
    </>
  );
};

export default React.memo(ValidationFilters); 