"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell as PieCell } from "recharts";
import AdminHeader from "@/components/admin/AdminHeader";
import StatCard from "@/components/admin/StatCard";
import { Panel, PanelHeader, PanelTitle } from "@/components/admin/Panel";
import { Table, TableHeadRow, HeadCell, Row, Cell } from "@/components/admin/AdminTable";
import { StatusBadge, toneDotColor } from "@/components/admin/StatusBadge";
import { AlertTriangleIcon, BagIcon, BoxIcon, ChevronRightIcon, DollarIcon, UsersIcon } from "@/components/icons/Icons";
import { orderStatusMeta, type AdminOrderStatus } from "@/lib/data/mockAdmin";
import { formatDateBR, formatPriceBRL } from "@/lib/format";
import {
  fetchBestSellers,
  fetchOrderStatusBreakdown,
  fetchOutOfStock,
  fetchSalesChart,
  fetchSummary,
  type BestSellerEntry,
  type DashboardSummary,
  type OrderStatusCount,
  type OutOfStockEntry,
  type SalesChartPoint,
} from "@/lib/api/dashboard";
import { apiClient } from "@/lib/api/client";

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ChartRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const ChartWrap = styled.div`
  height: 260px;
`;

const Legend = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: ${({ theme }) => theme.spacing.md} 0 0;
  padding: 0;
  list-style: none;
`;

const LegendItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.xs};
`;

const Dot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const LegendCount = styled.span`
  margin-left: auto;
  color: ${({ theme }) => theme.colors.muted};
`;

const DonutWrap = styled.div`
  position: relative;
  height: 200px;
`;

const DonutCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
`;

const DonutTotal = styled.p`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin: 0;
`;

const DonutLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
  margin: 0;
`;

const BottomRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const ViewAll = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.gold};
  cursor: default;
`;

const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ProductRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Swatch = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: linear-gradient(135deg, #efe6d6, #c7b48f);
  flex-shrink: 0;
`;

const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const ProductRevenue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const AlertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const AlertRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  svg:first-child {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.colors.gold};
    flex-shrink: 0;
  }
`;

const AlertInfo = styled.div`
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const EmptyRow = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`;

interface AdminOrderRow {
  id: string;
  customerName: string | null;
  createdAt: string;
  status: AdminOrderStatus;
  total: string | number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [salesChart, setSalesChart] = useState<SalesChartPoint[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<{ total: number; breakdown: OrderStatusCount[] }>({
    total: 0,
    breakdown: [],
  });
  const [recentOrders, setRecentOrders] = useState<AdminOrderRow[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSellerEntry[]>([]);
  const [outOfStock, setOutOfStock] = useState<OutOfStockEntry[]>([]);

  useEffect(() => {
    fetchSummary().then(setSummary);
    fetchSalesChart(30).then(setSalesChart);
    fetchOrderStatusBreakdown().then(setStatusBreakdown);
    fetchBestSellers(4).then(setBestSellers);
    fetchOutOfStock().then(setOutOfStock);
    apiClient
      .get<{ items: AdminOrderRow[] }>("/orders/admin", { params: { limit: 5 } })
      .then(({ data }) => setRecentOrders(data.items));
  }, []);

  const stats = summary
    ? [
        { icon: <DollarIcon />, label: "Faturamento Total", value: formatPriceBRL(summary.totalSales) },
        { icon: <BagIcon />, label: "Pedidos", value: String(summary.ordersCount) },
        { icon: <UsersIcon />, label: "Clientes", value: String(summary.customersCount) },
        { icon: <BoxIcon />, label: "Ticket Médio", value: formatPriceBRL(summary.averageTicket) },
      ]
    : [];

  return (
    <>
      <AdminHeader title="Dashboard" subtitle="Bem-vindo ao painel administrativo da Essence Perfumes." />

      <StatGrid>
        {stats.map((stat) => (
          <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
        ))}
      </StatGrid>

      <ChartRow>
        <Panel>
          <PanelHeader>
            <PanelTitle>Faturamento (últimos 30 dias)</PanelTitle>
          </PanelHeader>
          <ChartWrap>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesChart}>
                <CartesianGrid stroke="#E4DCCB" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: string) => formatDateBR(value)}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => `R$ ${value}`}
                />
                <Tooltip
                  labelFormatter={(value) => (typeof value === "string" ? formatDateBR(value) : String(value))}
                  formatter={(value) => formatPriceBRL(Number(value))}
                />
                <Line type="monotone" dataKey="revenue" name="Receita" stroke="#0E0D0C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrap>
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Pedidos por status</PanelTitle>
          </PanelHeader>
          {statusBreakdown.total === 0 ? (
            <EmptyRow>Nenhum pedido ainda.</EmptyRow>
          ) : (
            <>
              <DonutWrap>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusBreakdown.breakdown}
                      dataKey="count"
                      nameKey="status"
                      innerRadius="65%"
                      outerRadius="100%"
                      paddingAngle={2}
                    >
                      {statusBreakdown.breakdown.map((slice) => (
                        <PieCell key={slice.status} fill={toneDotColor[orderStatusMeta[slice.status].tone]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <DonutCenter>
                  <DonutTotal>{statusBreakdown.total}</DonutTotal>
                  <DonutLabel>Pedidos</DonutLabel>
                </DonutCenter>
              </DonutWrap>
              <Legend>
                {statusBreakdown.breakdown.map((slice) => {
                  const meta = orderStatusMeta[slice.status];
                  return (
                    <LegendItem key={slice.status}>
                      <Dot $color={toneDotColor[meta.tone]} />
                      {meta.label}
                      <LegendCount>
                        {slice.count} ({slice.pct}%)
                      </LegendCount>
                    </LegendItem>
                  );
                })}
              </Legend>
            </>
          )}
        </Panel>
      </ChartRow>

      <BottomRow>
        <Panel>
          <PanelHeader>
            <PanelTitle>Pedidos recentes</PanelTitle>
            <ViewAll>Ver todos</ViewAll>
          </PanelHeader>
          <Table>
            <TableHeadRow $columns="1fr 1fr 1fr 1fr">
              <HeadCell>Cliente</HeadCell>
              <HeadCell>Data</HeadCell>
              <HeadCell>Status</HeadCell>
              <HeadCell>Total</HeadCell>
            </TableHeadRow>
            {recentOrders.length === 0 && <EmptyRow>Nenhum pedido ainda.</EmptyRow>}
            {recentOrders.map((order) => (
              <Row key={order.id} $columns="1fr 1fr 1fr 1fr">
                <Cell>
                  <strong>{order.customerName ?? order.id.slice(0, 8)}</strong>
                </Cell>
                <Cell>{formatDateBR(order.createdAt)}</Cell>
                <Cell>
                  <StatusBadge $tone={orderStatusMeta[order.status].tone}>
                    {orderStatusMeta[order.status].label}
                  </StatusBadge>
                </Cell>
                <Cell>{formatPriceBRL(Number(order.total))}</Cell>
              </Row>
            ))}
          </Table>
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Produtos mais vendidos</PanelTitle>
            <ViewAll>Ver todos</ViewAll>
          </PanelHeader>
          <ProductList>
            {bestSellers.length === 0 && <EmptyRow>Sem vendas registradas ainda.</EmptyRow>}
            {bestSellers.map((product) => (
              <ProductRow key={product.productId}>
                <Swatch />
                <ProductInfo>
                  <strong>{product.productName}</strong>
                  <span>{product.quantitySold} vendas</span>
                </ProductInfo>
                <ProductRevenue>{formatPriceBRL(product.revenue)}</ProductRevenue>
              </ProductRow>
            ))}
          </ProductList>
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Alertas</PanelTitle>
            <ViewAll>Ver todos</ViewAll>
          </PanelHeader>
          <AlertList>
            {outOfStock.length === 0 && <EmptyRow>Nenhum produto esgotado.</EmptyRow>}
            {outOfStock.map((item) => (
              <AlertRow key={item.productId}>
                <AlertTriangleIcon />
                <AlertInfo>
                  <strong>{item.name}</strong>
                  <span>Estoque esgotado ({item.sku})</span>
                </AlertInfo>
                <ChevronRightIcon width={16} height={16} />
              </AlertRow>
            ))}
          </AlertList>
        </Panel>
      </BottomRow>
    </>
  );
}
