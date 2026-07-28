"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import AdminHeader from "@/components/admin/AdminHeader";
import StatCard from "@/components/admin/StatCard";
import { Panel, PanelHeader, PanelTitle } from "@/components/admin/Panel";
import { Table, TableHeadRow, HeadCell, Row, Cell } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Input, Select } from "@/components/form/FormField";
import { BoxIcon, PackageIcon, AlertTriangleIcon } from "@/components/icons/Icons";
import { parseApiError } from "@/lib/api/client";
import { decreaseStock, fetchStockItems, increaseStock, type StockItemView } from "@/lib/api/stock";
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const statusMeta: Record<StockItemView["status"], { label: string; tone: "success" | "gold" | "danger" }> = {
  ok: { label: "OK", tone: "success" },
  baixo: { label: "Estoque baixo", tone: "gold" },
  esgotado: { label: "Esgotado", tone: "danger" },
};

export default function EstoquePage() {
  const [items, setItems] = useState<StockItemView[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchStockItems()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) setError(parseApiError(err, "Não foi possível carregar o estoque."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  async function adjustStock(productId: string, direction: 1 | -1) {
    setPendingId(productId);
    setError(null);
    try {
      const updated = direction === 1 ? await increaseStock(productId) : await decreaseStock(productId);
      setItems((current) =>
        current.map((item) =>
          item.productId === productId
            ? {
                ...item,
                currentStock: updated.quantity,
                minStock: updated.minQuantity,
                lastRestock: updated.updatedAt,
                status:
                  updated.quantity <= 0 ? "esgotado" : updated.quantity <= updated.minQuantity ? "baixo" : "ok",
              }
            : item,
        ),
      );
    } catch (err) {
      setError(parseApiError(err, "Não foi possível atualizar o estoque."));
    } finally {
      setPendingId(null);
    }
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

        {error && <ErrorText role="alert">{error}</ErrorText>}

        {isLoading ? (
          <EmptyState>Carregando estoque...</EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState>Nenhum item encontrado.</EmptyState>
        ) : (
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
            <Row key={item.id} $columns="2fr 1fr 1fr 1fr 1fr 1.3fr">
              <Cell>{item.name}</Cell>
              <Cell>{item.sku}</Cell>
              <Cell>
                <AdjustRow>
                  <AdjustButton
                    type="button"
                    onClick={() => adjustStock(item.productId, -1)}
                    disabled={pendingId === item.productId || item.currentStock <= 0}
                    aria-label="Diminuir"
                  >
                    −
                  </AdjustButton>
                  {item.currentStock}
                  <AdjustButton
                    type="button"
                    onClick={() => adjustStock(item.productId, 1)}
                    disabled={pendingId === item.productId}
                    aria-label="Aumentar"
                  >
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
        )}
      </Panel>
    </>
  );
}
