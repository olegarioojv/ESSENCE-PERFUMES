"use client";

import { useMemo, useState, type FormEvent } from "react";
import styled from "styled-components";
import AdminHeader from "@/components/admin/AdminHeader";
import StatCard from "@/components/admin/StatCard";
import { Panel, PanelHeader, PanelTitle } from "@/components/admin/Panel";
import { Table, TableHeadRow, HeadCell, Row, Cell } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import Button from "@/components/form/Button";
import FormField, { Input, Select } from "@/components/form/FormField";
import Modal from "@/components/ui/Modal";
import { EditIcon, PlusIcon, TagIcon, TrashIcon } from "@/components/icons/Icons";
import { mockCoupons, type Coupon } from "@/lib/data/mockAdmin";
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

const Code = styled.span`
  font-family: monospace;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};

  button {
    background: transparent;
    color: ${({ theme }) => theme.colors.muted};
    padding: ${({ theme }) => theme.spacing.xxs};

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      color: ${({ theme }) => theme.colors.gold};
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const statusMeta: Record<Coupon["status"], { label: string; tone: "success" | "gold" | "danger" }> = {
  ativo: { label: "Ativo", tone: "success" },
  agendado: { label: "Agendado", tone: "gold" },
  expirado: { label: "Expirado", tone: "danger" },
};

const emptyForm = {
  code: "",
  type: "percentual" as Coupon["type"],
  value: "",
  minOrder: "",
  usageLimit: "",
  expiresAt: "",
};

export default function CuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const stats = useMemo(() => {
    const active = coupons.filter((c) => c.status === "ativo").length;
    const totalUses = coupons.reduce((sum, c) => sum + c.usageCount, 0);
    const expired = coupons.filter((c) => c.status === "expirado").length;
    const discountGranted = coupons.reduce(
      (sum, c) => sum + (c.type === "fixo" ? c.value * c.usageCount : 0),
      0,
    );
    return { active, totalUses, expired, discountGranted };
  }, [coupons]);

  function openNew() {
    setEditingCode(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setEditingCode(coupon.code);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrder: coupon.minOrder ? String(coupon.minOrder) : "",
      usageLimit: String(coupon.usageLimit),
      expiresAt: coupon.expiresAt,
    });
    setModalOpen(true);
  }

  function handleDelete(code: string) {
    if (!window.confirm(`Excluir o cupom ${code}?`)) return;
    setCoupons((current) => current.filter((c) => c.code !== code));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const payload: Coupon = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value) || 0,
      minOrder: form.minOrder ? Number(form.minOrder) : undefined,
      usageLimit: Number(form.usageLimit) || 0,
      usageCount: editingCode ? coupons.find((c) => c.code === editingCode)?.usageCount ?? 0 : 0,
      expiresAt: form.expiresAt,
      status: "ativo",
    };

    setCoupons((current) => {
      if (editingCode) {
        return current.map((c) => (c.code === editingCode ? payload : c));
      }
      return [payload, ...current];
    });
    setModalOpen(false);
  }

  return (
    <>
      <AdminHeader title="Cupons" subtitle="Gerencie os cupons de desconto da loja." />

      <StatGrid>
        <StatCard icon={<TagIcon />} label="Cupons Ativos" value={String(stats.active)} />
        <StatCard icon={<TagIcon />} label="Total de Usos" value={String(stats.totalUses)} />
        <StatCard icon={<TagIcon />} label="Desconto Concedido" value={formatPriceBRL(stats.discountGranted)} />
        <StatCard icon={<TagIcon />} label="Cupons Expirados" value={String(stats.expired)} />
      </StatGrid>

      <Panel>
        <PanelHeader>
          <PanelTitle>Todos os cupons</PanelTitle>
          <Button type="button" onClick={openNew}>
            <PlusIcon /> Novo Cupom
          </Button>
        </PanelHeader>

        <Table>
          <TableHeadRow $columns="1.3fr 1fr 1fr 1fr 1fr 1fr 0.7fr">
            <HeadCell>Código</HeadCell>
            <HeadCell>Tipo</HeadCell>
            <HeadCell>Valor</HeadCell>
            <HeadCell>Uso</HeadCell>
            <HeadCell>Validade</HeadCell>
            <HeadCell>Status</HeadCell>
            <HeadCell>Ações</HeadCell>
          </TableHeadRow>
          {coupons.map((coupon) => (
            <Row key={coupon.code} $columns="1.3fr 1fr 1fr 1fr 1fr 1fr 0.7fr">
              <Cell>
                <Code>{coupon.code}</Code>
              </Cell>
              <Cell>{coupon.type === "percentual" ? "Percentual" : "Valor fixo"}</Cell>
              <Cell>{coupon.type === "percentual" ? `${coupon.value}%` : formatPriceBRL(coupon.value)}</Cell>
              <Cell>
                {coupon.usageCount}/{coupon.usageLimit}
              </Cell>
              <Cell>{formatDateBR(coupon.expiresAt)}</Cell>
              <Cell>
                <StatusBadge $tone={statusMeta[coupon.status].tone}>{statusMeta[coupon.status].label}</StatusBadge>
              </Cell>
              <Cell>
                <Actions>
                  <button type="button" aria-label="Editar" onClick={() => openEdit(coupon)}>
                    <EditIcon />
                  </button>
                  <button type="button" aria-label="Excluir" onClick={() => handleDelete(coupon.code)}>
                    <TrashIcon />
                  </button>
                </Actions>
              </Cell>
            </Row>
          ))}
        </Table>
      </Panel>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCode ? "Editar Cupom" : "Novo Cupom"}
      >
        <Form onSubmit={handleSubmit}>
          <FormField label="Código" htmlFor="code">
            <Input
              id="code"
              required
              value={form.code}
              onChange={(event) => setForm((f) => ({ ...f, code: event.target.value }))}
            />
          </FormField>
          <FormRow>
            <FormField label="Tipo" htmlFor="type">
              <Select
                id="type"
                value={form.type}
                onChange={(event) => setForm((f) => ({ ...f, type: event.target.value as Coupon["type"] }))}
              >
                <option value="percentual">Percentual</option>
                <option value="fixo">Valor fixo</option>
              </Select>
            </FormField>
            <FormField label="Valor" htmlFor="value">
              <Input
                id="value"
                type="number"
                step="0.01"
                required
                value={form.value}
                onChange={(event) => setForm((f) => ({ ...f, value: event.target.value }))}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Pedido mínimo (R$)" htmlFor="minOrder">
              <Input
                id="minOrder"
                type="number"
                value={form.minOrder}
                onChange={(event) => setForm((f) => ({ ...f, minOrder: event.target.value }))}
              />
            </FormField>
            <FormField label="Limite de uso" htmlFor="usageLimit">
              <Input
                id="usageLimit"
                type="number"
                required
                value={form.usageLimit}
                onChange={(event) => setForm((f) => ({ ...f, usageLimit: event.target.value }))}
              />
            </FormField>
          </FormRow>
          <FormField label="Validade" htmlFor="expiresAt">
            <Input
              id="expiresAt"
              type="date"
              required
              value={form.expiresAt}
              onChange={(event) => setForm((f) => ({ ...f, expiresAt: event.target.value }))}
            />
          </FormField>
          <FormActions>
            <Button type="button" $variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Cupom</Button>
          </FormActions>
        </Form>
      </Modal>
    </>
  );
}
