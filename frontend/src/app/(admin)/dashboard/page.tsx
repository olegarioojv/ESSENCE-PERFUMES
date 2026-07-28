"use client";

import styled from "styled-components";
import { CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell as PieCell } from "recharts";
import AdminHeader from "@/components/admin/AdminHeader";
import StatCard from "@/components/admin/StatCard";
import { Panel, PanelHeader, PanelTitle } from "@/components/admin/Panel";
import { Table, TableHeadRow, HeadCell, Row, Cell } from "@/components/admin/AdminTable";
import { StatusBadge, toneDotColor } from "@/components/admin/StatusBadge";
import { AlertTriangleIcon, BagIcon, BoxIcon, ChevronRightIcon, DollarIcon, UsersIcon } from "@/components/icons/Icons";
import {
  adminAlerts,
  dashboardStats,
  orderStatusBreakdown,
  orderStatusMeta,
  recentAdminOrders,
  revenueSeries,
  topProducts,
} from "@/lib/data/mockAdmin";
import { formatDateBR, formatPriceBRL } from "@/lib/format";

const statIcons = [DollarIcon, BagIcon, UsersIcon, BoxIcon];

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

const Swatch = styled.div<{ $from: string; $to: string }>`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: linear-gradient(135deg, ${({ $from }) => $from}, ${({ $to }) => $to});
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

export default function DashboardPage() {
  return (
    <>
      <AdminHeader title="Dashboard" subtitle="Bem-vindo ao painel administrativo da Essence Perfumes." />

      <StatGrid>
        {dashboardStats.map((stat, index) => {
          const Icon = statIcons[index] ?? DollarIcon;
          return (
            <StatCard
              key={stat.label}
              icon={<Icon />}
              label={stat.label}
              value={stat.value}
              deltaPct={stat.deltaPct}
              direction={stat.direction}
              caption={stat.caption}
            />
          );
        })}
      </StatGrid>

      <ChartRow>
        <Panel>
          <PanelHeader>
            <PanelTitle>Faturamento</PanelTitle>
          </PanelHeader>
          <ChartWrap>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueSeries}>
                <CartesianGrid stroke="#E4DCCB" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => `R$ ${value / 1000}k`}
                />
                <Tooltip formatter={(value) => formatPriceBRL(Number(value))} />
                <Line type="monotone" dataKey="current" name="Este mês" stroke="#0E0D0C" strokeWidth={2} dot={false} />
                <Line
                  type="monotone"
                  dataKey="previous"
                  name="Mês anterior"
                  stroke="#B08D57"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrap>
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Pedidos por status</PanelTitle>
          </PanelHeader>
          <DonutWrap>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  innerRadius="65%"
                  outerRadius="100%"
                  paddingAngle={2}
                >
                  {orderStatusBreakdown.map((slice) => (
                    <PieCell key={slice.status} fill={toneDotColor[orderStatusMeta[slice.status].tone]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <DonutCenter>
              <DonutTotal>152</DonutTotal>
              <DonutLabel>Pedidos</DonutLabel>
            </DonutCenter>
          </DonutWrap>
          <Legend>
            {orderStatusBreakdown.map((slice) => {
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
              <HeadCell>Pedido</HeadCell>
              <HeadCell>Data</HeadCell>
              <HeadCell>Status</HeadCell>
              <HeadCell>Total</HeadCell>
            </TableHeadRow>
            {recentAdminOrders.map((order) => (
              <Row key={order.id} $columns="1fr 1fr 1fr 1fr">
                <Cell>
                  <strong>{order.id}</strong>
                </Cell>
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
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Produtos mais vendidos</PanelTitle>
            <ViewAll>Ver todos</ViewAll>
          </PanelHeader>
          <ProductList>
            {topProducts.map((product) => (
              <ProductRow key={product.slug}>
                <Swatch $from={product.swatch[0]} $to={product.swatch[1]} />
                <ProductInfo>
                  <strong>{product.name}</strong>
                  <span>{product.sales} vendas</span>
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
            {adminAlerts.map((alert) => (
              <AlertRow key={alert.id}>
                <AlertTriangleIcon />
                <AlertInfo>
                  <strong>{alert.title}</strong>
                  <span>{alert.description}</span>
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
