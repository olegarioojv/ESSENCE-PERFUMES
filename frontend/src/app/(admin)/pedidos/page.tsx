"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import AdminHeader from "@/components/admin/AdminHeader";
import { Panel, PanelHeader, PanelTitle } from "@/components/admin/Panel";
import { Table, TableHeadRow, HeadCell, Row, Cell } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import Button from "@/components/form/Button";
import { Input, Select } from "@/components/form/FormField";
import Modal from "@/components/ui/Modal";
import { EyeIcon } from "@/components/icons/Icons";
import { allAdminOrders, orderStatusMeta, type AdminOrderDetail, type AdminOrderStatus } from "@/lib/data/mockAdmin";
import { formatDateBR, formatPriceBRL } from "@/lib/format";

const FilterBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  input {
    flex: 1;
  }
`;

const DetailList = styled.dl`
  display: grid;
  grid-template-columns: 140px 1fr;
  row-gap: ${({ theme }) => theme.spacing.sm};
  margin: 0;

  dt {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${({ theme }) => theme.colors.muted};
  }

  dd {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const PageInfo = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`;

const PAGE_SIZE = 8;
const statusOptions: AdminOrderStatus[] = ["entregue", "transito", "processando", "cancelado", "estornado"];

export default function PedidosPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [page, setPage] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);

  const filtered = useMemo(
    () =>
      allAdminOrders.filter((order) => {
        const query = search.toLowerCase();
        const matchesSearch =
          order.id.toLowerCase().includes(query) || order.customer.toLowerCase().includes(query);
        const matchesStatus = statusFilter === "todos" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [search, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  function handleFilterChange(update: () => void) {
    update();
    setPage(0);
  }

  return (
    <>
      <AdminHeader title="Pedidos" subtitle="Acompanhe e gerencie os pedidos da loja." />

      <Panel>
        <PanelHeader>
          <PanelTitle>Todos os pedidos</PanelTitle>
        </PanelHeader>

        <FilterBar>
          <Input
            placeholder="Buscar por pedido ou cliente..."
            value={search}
            onChange={(event) => handleFilterChange(() => setSearch(event.target.value))}
          />
          <Select
            value={statusFilter}
            onChange={(event) => handleFilterChange(() => setStatusFilter(event.target.value))}
          >
            <option value="todos">Todos os status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {orderStatusMeta[status].label}
              </option>
            ))}
          </Select>
        </FilterBar>

        <Table>
          <TableHeadRow $columns="1fr 1.5fr 1fr 0.7fr 1fr 1fr 0.6fr">
            <HeadCell>Pedido</HeadCell>
            <HeadCell>Cliente</HeadCell>
            <HeadCell>Data</HeadCell>
            <HeadCell>Itens</HeadCell>
            <HeadCell>Status</HeadCell>
            <HeadCell>Total</HeadCell>
            <HeadCell>Detalhe</HeadCell>
          </TableHeadRow>
          {paginated.map((order) => (
            <Row key={order.id} $columns="1fr 1.5fr 1fr 0.7fr 1fr 1fr 0.6fr">
              <Cell>{order.id}</Cell>
              <Cell>{order.customer}</Cell>
              <Cell>{formatDateBR(order.date)}</Cell>
              <Cell>{order.items}</Cell>
              <Cell>
                <StatusBadge $tone={orderStatusMeta[order.status].tone}>
                  {orderStatusMeta[order.status].label}
                </StatusBadge>
              </Cell>
              <Cell>{formatPriceBRL(order.total)}</Cell>
              <Cell>
                <Button type="button" $variant="secondary" onClick={() => setSelectedOrder(order)}>
                  <EyeIcon />
                </Button>
              </Cell>
            </Row>
          ))}
        </Table>

        <Pagination>
          <Button
            type="button"
            $variant="secondary"
            disabled={currentPage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Anterior
          </Button>
          <PageInfo>
            Página {currentPage + 1} de {totalPages}
          </PageInfo>
          <Button
            type="button"
            $variant="secondary"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Próxima
          </Button>
        </Pagination>
      </Panel>

      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={selectedOrder?.id ?? ""}>
        {selectedOrder && (
          <DetailList>
            <dt>Cliente</dt>
            <dd>{selectedOrder.customer}</dd>
            <dt>Data</dt>
            <dd>{formatDateBR(selectedOrder.date)}</dd>
            <dt>Status</dt>
            <dd>
              <StatusBadge $tone={orderStatusMeta[selectedOrder.status].tone}>
                {orderStatusMeta[selectedOrder.status].label}
              </StatusBadge>
            </dd>
            <dt>Itens</dt>
            <dd>{selectedOrder.items}</dd>
            <dt>Pagamento</dt>
            <dd>{selectedOrder.paymentMethod}</dd>
            <dt>Endereço</dt>
            <dd>{selectedOrder.address}</dd>
            <dt>Total</dt>
            <dd>{formatPriceBRL(selectedOrder.total)}</dd>
          </DetailList>
        )}
      </Modal>
    </>
  );
}
