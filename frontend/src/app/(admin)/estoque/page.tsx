"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import AdminHeader from "@/components/admin/AdminHeader";
import StatCard from "@/components/admin/StatCard";
import { Panel, PanelHeader, PanelTitle } from "@/components/admin/Panel";
import { Table, TableHeadRow, HeadCell, Row, Cell } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Input, Select } from "@/components/form/FormField";
import { BoxIcon, PackageIcon, AlertTriangleIcon } from "@/components/icons/Icons";
import { stockItems as initialStockItems, type StockItem } from "@/lib/data/mockAdmin";
import { formatDateBR } from "@/lib/format";

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  input {
    flex: 1;
  }
`;

const AdjustRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const AdjustButton = styled.button`
  width: 24px;
  height: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.ink};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: ${({ theme }) => theme.colors.gold};
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const statusMeta: Record<StockItem["status"], { label: string; tone: "success" | "gold" | "danger" }> = {
  ok: { label: "OK", tone: "success" },
  baixo: { label: "Estoque baixo", tone: "gold" },
  esgotado: { label: "Esgotado", tone: "danger" },
};

export default function EstoquePage() {
  const [items, setItems] = useState<StockItem[]>(initialStockItems);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const stats = useMemo(
    () => ({
      total: items.length,
      baixo: items.filter((item) => item.status === "baixo").length,
      esgotado: items.filter((item) => item.status === "esgotado").length,
    }),
    [items],
  );

  const filtered = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "todos" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function adjustStock(slug: string, delta: number) {
    setItems((current) =>
      current.map((item) => {
        if (item.productSlug !== slug) return item;
        const currentStock = Math.max(0, item.currentStock + delta);
        const status: StockItem["status"] = currentStock <= 0 ? "esgotado" : currentStock <= item.minStock ? "baixo" : "ok";
        return { ...item, currentStock, status };
      }),
    );
  }

  return (
    <>
      <AdminHeader title="Estoque" subtitle="Acompanhe os níveis de estoque dos produtos." />

      <StatGrid>
        <StatCard icon={<PackageIcon />} label="Total de Itens" value={String(stats.total)} />
        <StatCard icon={<AlertTriangleIcon />} label="Estoque Baixo" value={String(stats.baixo)} />
        <StatCard icon={<BoxIcon />} label="Esgotados" value={String(stats.esgotado)} />
      </StatGrid>

      <Panel>
        <PanelHeader>
          <PanelTitle>Itens em estoque</PanelTitle>
        </PanelHeader>

        <FilterBar>
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="todos">Todos os status</option>
            <option value="ok">OK</option>
            <option value="baixo">Estoque baixo</option>
            <option value="esgotado">Esgotado</option>
          </Select>
        </FilterBar>

        <Table>
          <TableHeadRow $columns="2fr 1fr 1fr 1fr 1fr 1.3fr">
            <HeadCell>Produto</HeadCell>
            <HeadCell>SKU</HeadCell>
            <HeadCell>Estoque atual</HeadCell>
            <HeadCell>Estoque mínimo</HeadCell>
            <HeadCell>Última reposição</HeadCell>
            <HeadCell>Status</HeadCell>
          </TableHeadRow>
          {filtered.map((item) => (
            <Row key={item.productSlug} $columns="2fr 1fr 1fr 1fr 1fr 1.3fr">
              <Cell>{item.name}</Cell>
              <Cell>{item.sku}</Cell>
              <Cell>
                <AdjustRow>
                  <AdjustButton type="button" onClick={() => adjustStock(item.productSlug, -1)} aria-label="Diminuir">
                    −
                  </AdjustButton>
                  {item.currentStock}
                  <AdjustButton type="button" onClick={() => adjustStock(item.productSlug, 1)} aria-label="Aumentar">
                    +
                  </AdjustButton>
                </AdjustRow>
              </Cell>
              <Cell>{item.minStock}</Cell>
              <Cell>{formatDateBR(item.lastRestock)}</Cell>
              <Cell>
                <StatusBadge $tone={statusMeta[item.status].tone}>{statusMeta[item.status].label}</StatusBadge>
              </Cell>
            </Row>
          ))}
        </Table>
      </Panel>
    </>
  );
}
