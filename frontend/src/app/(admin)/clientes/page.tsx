"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import AdminHeader from "@/components/admin/AdminHeader";
import StatCard from "@/components/admin/StatCard";
import { Panel, PanelHeader, PanelTitle } from "@/components/admin/Panel";
import { Table, TableHeadRow, HeadCell, Row, Cell } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import Button from "@/components/form/Button";
import { Input, Select } from "@/components/form/FormField";
import Modal from "@/components/ui/Modal";
import { EyeIcon, ReceiptIcon, UsersIcon } from "@/components/icons/Icons";
import { allAdminOrders, mockCustomers, orderStatusMeta, type Customer } from "@/lib/data/mockAdmin";
import { formatDateBR, formatPriceBRL } from "@/lib/format";

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
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

const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.goldLight};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  flex-shrink: 0;
`;

const NameInfo = styled.div`
  strong {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const stats = useMemo(() => {
    const total = mockCustomers.length;
    const active = mockCustomers.filter((c) => c.status === "ativo").length;
    const avgSpent = mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / (total || 1);
    return { total, active, avgSpent };
  }, []);

  const filtered = mockCustomers.filter((customer) => {
    const query = search.toLowerCase();
    const matchesSearch =
      customer.name.toLowerCase().includes(query) || customer.email.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "todos" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const customerOrders = selectedCustomer
    ? allAdminOrders.filter((order) => order.customer === selectedCustomer.name)
    : [];

  return (
    <>
      <AdminHeader title="Clientes" subtitle="Veja e gerencie os clientes da loja." />

      <StatGrid>
        <StatCard icon={<UsersIcon />} label="Total de Clientes" value={String(stats.total)} />
        <StatCard icon={<UsersIcon />} label="Clientes Ativos" value={String(stats.active)} />
        <StatCard icon={<ReceiptIcon />} label="Ticket Médio" value={formatPriceBRL(stats.avgSpent)} />
        <StatCard icon={<UsersIcon />} label="Novos este mês" value="4" />
      </StatGrid>

      <Panel>
        <PanelHeader>
          <PanelTitle>Todos os clientes</PanelTitle>
        </PanelHeader>

        <FilterBar>
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </Select>
        </FilterBar>

        <Table>
          <TableHeadRow $columns="2fr 1.3fr 1fr 1.2fr 1fr 1fr 0.6fr">
            <HeadCell>Cliente</HeadCell>
            <HeadCell>Telefone</HeadCell>
            <HeadCell>Pedidos</HeadCell>
            <HeadCell>Total gasto</HeadCell>
            <HeadCell>Cliente desde</HeadCell>
            <HeadCell>Status</HeadCell>
            <HeadCell>Perfil</HeadCell>
          </TableHeadRow>
          {filtered.map((customer) => (
            <Row key={customer.id} $columns="2fr 1.3fr 1fr 1.2fr 1fr 1fr 0.6fr">
              <Cell>
                <NameCell>
                  <Avatar>{initials(customer.name)}</Avatar>
                  <NameInfo>
                    <strong>{customer.name}</strong>
                    <span>{customer.email}</span>
                  </NameInfo>
                </NameCell>
              </Cell>
              <Cell>{customer.phone}</Cell>
              <Cell>{customer.ordersCount}</Cell>
              <Cell>{formatPriceBRL(customer.totalSpent)}</Cell>
              <Cell>{formatDateBR(customer.since)}</Cell>
              <Cell>
                <StatusBadge $tone={customer.status === "ativo" ? "success" : "pale"}>
                  {customer.status === "ativo" ? "Ativo" : "Inativo"}
                </StatusBadge>
              </Cell>
              <Cell>
                <Button type="button" $variant="secondary" onClick={() => setSelectedCustomer(customer)}>
                  <EyeIcon />
                </Button>
              </Cell>
            </Row>
          ))}
        </Table>
      </Panel>

      <Modal
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name ?? ""}
      >
        {selectedCustomer && (
          <>
            <ProfileHeader>
              <Avatar>{initials(selectedCustomer.name)}</Avatar>
              <NameInfo>
                <strong>{selectedCustomer.name}</strong>
                <span>{selectedCustomer.email}</span>
              </NameInfo>
            </ProfileHeader>
            <Table>
              <TableHeadRow $columns="1fr 1fr 1fr 1fr">
                <HeadCell>Pedido</HeadCell>
                <HeadCell>Data</HeadCell>
                <HeadCell>Status</HeadCell>
                <HeadCell>Total</HeadCell>
              </TableHeadRow>
              {customerOrders.length === 0 && (
                <Row $columns="1fr">
                  <Cell>Nenhum pedido encontrado.</Cell>
                </Row>
              )}
              {customerOrders.map((order) => (
                <Row key={order.id} $columns="1fr 1fr 1fr 1fr">
                  <Cell>{order.id}</Cell>
                  <Cell>{formatDateBR(order.date)}</Cell>
                  <Cell>
                    <StatusBadge $tone={orderStatusMeta[order.status].tone}>
                      {orderStatusMeta[order.status].label}
                    </StatusBadge>
                  </Cell>
                  <Cell>{formatPriceBRL(order.total)}</Cell>
                </Row>
              ))}
            </Table>
          </>
        )}
      </Modal>
    </>
  );
}
