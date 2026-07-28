"use client";

import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import AdminHeader from "@/components/admin/AdminHeader";
import { Panel, PanelHeader, PanelTitle } from "@/components/admin/Panel";
import { Table, TableHeadRow, HeadCell, Row, Cell } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import Button from "@/components/form/Button";
import { Input, Select } from "@/components/form/FormField";
import Modal from "@/components/ui/Modal";
import { EyeIcon } from "@/components/icons/Icons";
import { orderStatusMeta, type AdminOrderStatus } from "@/lib/data/mockAdmin";
import {
  fetchAdminOrders,
  fetchOrderDetail,
  fetchOrderTimeline,
  updateOrderStatus,
  parseApiError,
  type AdminOrder,
  type OrderDetail,
  type OrderStatusHistoryEntry,
} from "@/lib/api/orders";
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

const ItemsList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  li {
    display: flex;
    justify-content: space-between;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const TimelineList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  li {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.muted};
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

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  select {
    flex: 1;
  }
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: 0;
`;

const EmptyState = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg} 0;
`;

const PAGE_SIZE = 8;
const statusOptions: AdminOrderStatus[] = ["pendente", "pago", "em_preparacao", "enviado", "entregue", "cancelado"];

export default function PedidosPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatus | "todos">("todos");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminOrder | null>(null);
  const [timeline, setTimeline] = useState<OrderStatusHistoryEntry[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await fetchAdminOrders({ page, limit: PAGE_SIZE, status: statusFilter });
      setOrders(result.items);
      setTotalPages(Math.max(1, result.totalPages));
    } catch (error) {
      setLoadError(parseApiError(error, "Não foi possível carregar os pedidos."));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filtered = orders.filter((order) => {
    const query = search.toLowerCase();
    return order.id.toLowerCase().includes(query) || order.customer.toLowerCase().includes(query);
  });

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value as AdminOrderStatus | "todos");
    setPage(1);
  }

  async function openDetail(order: AdminOrder) {
    setSelectedOrderId(order.id);
    setSelectedCustomer(order);
    setSelectedOrder(null);
    setTimeline([]);
    setDetailError(null);
    setStatusError(null);
    setDetailLoading(true);
    try {
      const [detail, history] = await Promise.all([fetchOrderDetail(order.id), fetchOrderTimeline(order.id)]);
      setSelectedOrder(detail);
      setTimeline(history);
    } catch (error) {
      setDetailError(parseApiError(error, "Não foi possível carregar o detalhe do pedido."));
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setSelectedOrderId(null);
    setSelectedOrder(null);
    setSelectedCustomer(null);
    setTimeline([]);
    setDetailError(null);
    setStatusError(null);
  }

  async function handleStatusChange(newStatus: AdminOrderStatus) {
    if (!selectedOrderId || !selectedOrder || newStatus === selectedOrder.status) return;
    setStatusUpdating(true);
    setStatusError(null);
    try {
      const updated = await updateOrderStatus(selectedOrderId, newStatus);
      setSelectedOrder(updated);
      const history = await fetchOrderTimeline(selectedOrderId);
      setTimeline(history);
      await loadOrders();
    } catch (error) {
      setStatusError(parseApiError(error, "Não foi possível atualizar o status do pedido."));
    } finally {
      setStatusUpdating(false);
    }
  }

  const isTerminal = selectedOrder?.status === "entregue" || selectedOrder?.status === "cancelado";

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
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select value={statusFilter} onChange={(event) => handleStatusFilterChange(event.target.value)}>
            <option value="todos">Todos os status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {orderStatusMeta[status].label}
              </option>
            ))}
          </Select>
        </FilterBar>

        {loadError && <ErrorText>{loadError}</ErrorText>}

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
          {!loading && filtered.length === 0 && !loadError && <EmptyState>Nenhum pedido encontrado.</EmptyState>}
          {filtered.map((order) => (
            <Row key={order.id} $columns="1fr 1.5fr 1fr 0.7fr 1fr 1fr 0.6fr">
              <Cell>{order.id}</Cell>
              <Cell>{order.customer}</Cell>
              <Cell>{formatDateBR(order.date)}</Cell>
              <Cell>—</Cell>
              <Cell>
                <StatusBadge $tone={orderStatusMeta[order.status].tone}>
                  {orderStatusMeta[order.status].label}
                </StatusBadge>
              </Cell>
              <Cell>{formatPriceBRL(order.total)}</Cell>
              <Cell>
                <Button type="button" $variant="secondary" onClick={() => openDetail(order)}>
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
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <PageInfo>
            Página {page} de {totalPages}
          </PageInfo>
          <Button
            type="button"
            $variant="secondary"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </Button>
        </Pagination>
      </Panel>

      <Modal open={!!selectedOrderId} onClose={closeDetail} title={selectedOrderId ?? ""}>
        {detailLoading && <EmptyState>Carregando pedido...</EmptyState>}
        {detailError && <ErrorText>{detailError}</ErrorText>}
        {!detailLoading && !detailError && selectedOrder && selectedCustomer && (
          <>
            <DetailList>
              <dt>Cliente</dt>
              <dd>{selectedCustomer.customer}</dd>
              <dt>E-mail</dt>
              <dd>{selectedCustomer.customerEmail ?? "—"}</dd>
              <dt>Data</dt>
              <dd>{formatDateBR(selectedOrder.createdAt)}</dd>
              <dt>Status</dt>
              <dd>
                <StatusRow>
                  <Select
                    value={selectedOrder.status}
                    disabled={statusUpdating || isTerminal}
                    onChange={(event) => handleStatusChange(event.target.value as AdminOrderStatus)}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {orderStatusMeta[status].label}
                      </option>
                    ))}
                  </Select>
                  <StatusBadge $tone={orderStatusMeta[selectedOrder.status].tone}>
                    {orderStatusMeta[selectedOrder.status].label}
                  </StatusBadge>
                </StatusRow>
              </dd>
              {isTerminal && (
                <>
                  <dt />
                  <dd>
                    <ErrorText as="span">Pedidos {orderStatusMeta[selectedOrder.status].label.toLowerCase()} não podem mudar de status.</ErrorText>
                  </dd>
                </>
              )}
              {statusError && (
                <>
                  <dt />
                  <dd>
                    <ErrorText>{statusError}</ErrorText>
                  </dd>
                </>
              )}
              <dt>Itens</dt>
              <dd>
                <ItemsList>
                  {selectedOrder.items.map((item) => (
                    <li key={item.id}>
                      <span>
                        {item.quantity}x {item.productName}
                      </span>
                      <span>{formatPriceBRL(Number(item.lineTotal))}</span>
                    </li>
                  ))}
                </ItemsList>
              </dd>
              {selectedOrder.couponCode && (
                <>
                  <dt>Cupom</dt>
                  <dd>{selectedOrder.couponCode}</dd>
                </>
              )}
              <dt>Total</dt>
              <dd>{formatPriceBRL(Number(selectedOrder.total))}</dd>
              <dt>Histórico</dt>
              <dd>
                <TimelineList>
                  {timeline.length === 0 && <li>Sem histórico registrado.</li>}
                  {timeline.map((entry) => (
                    <li key={entry.id}>
                      {formatDateBR(entry.createdAt)} — {orderStatusMeta[entry.status].label}
                      {entry.note ? ` (${entry.note})` : ""}
                    </li>
                  ))}
                </TimelineList>
              </dd>
            </DetailList>
          </>
        )}
      </Modal>
    </>
  );
}
