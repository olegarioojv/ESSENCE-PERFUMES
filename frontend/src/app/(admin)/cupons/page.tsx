"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import { formatDateBR, formatPriceBRL } from "@/lib/format";
import {
  createCoupon,
  deleteCoupon,
  fetchCoupons,
  parseApiError,
  updateCoupon,
  type Coupon,
  type CouponStatus,
  type CouponType,
} from "@/lib/api/coupons";

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

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const statusMeta: Record<CouponStatus, { label: string; tone: "success" | "gold" | "danger" }> = {
  ativo: { label: "Ativo", tone: "success" },
  agendado: { label: "Agendado", tone: "gold" },
  expirado: { label: "Expirado", tone: "danger" },
};

const emptyForm = {
  code: "",
  type: "percentual" as CouponType,
  value: "",
  usageLimit: "",
  expiresAt: "",
};

export default function CuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function loadCoupons() {
    fetchCoupons()
      .then(setCoupons)
      .catch((error) => setLoadError(parseApiError(error, "Não foi possível carregar os cupons.")));
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  const stats = useMemo(() => {
    const active = coupons.filter((c) => c.status === "ativo").length;
    const totalUses = coupons.reduce((sum, c) => sum + c.usedCount, 0);
    const expired = coupons.filter((c) => c.status === "expirado").length;
    const discountGranted = coupons.reduce(
      (sum, c) => sum + (c.type === "valor_fixo" ? c.value * c.usedCount : 0),
      0,
    );
    return { active, totalUses, expired, discountGranted };
  }, [coupons]);

  function openNew() {
    setEditingCoupon(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      usageLimit: coupon.maxUses != null ? String(coupon.maxUses) : "",
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleDelete(coupon: Coupon) {
    if (!window.confirm(`Excluir o cupom ${coupon.code}?`)) return;
    try {
      await deleteCoupon(coupon.id);
      setCoupons((current) => current.filter((c) => c.id !== coupon.id));
    } catch (error) {
      window.alert(parseApiError(error, "Não foi possível excluir o cupom."));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSaving(true);

    const payload = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value) || 0,
      maxUses: form.usageLimit ? Number(form.usageLimit) : undefined,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
    };

    try {
      if (editingCoupon) {
        const updated = await updateCoupon(editingCoupon.id, payload);
        setCoupons((current) => current.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await createCoupon(payload);
        setCoupons((current) => [created, ...current]);
      }
      setModalOpen(false);
    } catch (error) {
      setFormError(parseApiError(error, "Não foi possível salvar o cupom."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AdminHeader title="Cupons" subtitle="Gerencie os cupons de desconto da loja." />

      {loadError && <ErrorText>{loadError}</ErrorText>}

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
          {coupons.length === 0 && !loadError && (
            <Row $columns="1fr">
              <Cell>Nenhum cupom cadastrado.</Cell>
            </Row>
          )}
          {coupons.map((coupon) => (
            <Row key={coupon.id} $columns="1.3fr 1fr 1fr 1fr 1fr 1fr 0.7fr">
              <Cell>
                <Code>{coupon.code}</Code>
              </Cell>
              <Cell>{coupon.type === "percentual" ? "Percentual" : "Valor fixo"}</Cell>
              <Cell>{coupon.type === "percentual" ? `${coupon.value}%` : formatPriceBRL(coupon.value)}</Cell>
              <Cell>
                {coupon.usedCount}/{coupon.maxUses ?? "∞"}
              </Cell>
              <Cell>{coupon.expiresAt ? formatDateBR(coupon.expiresAt) : "—"}</Cell>
              <Cell>
                <StatusBadge $tone={statusMeta[coupon.status].tone}>{statusMeta[coupon.status].label}</StatusBadge>
              </Cell>
              <Cell>
                <Actions>
                  <button type="button" aria-label="Editar" onClick={() => openEdit(coupon)}>
                    <EditIcon />
                  </button>
                  <button type="button" aria-label="Excluir" onClick={() => handleDelete(coupon)}>
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
        title={editingCoupon ? "Editar Cupom" : "Novo Cupom"}
      >
        <Form onSubmit={handleSubmit}>
          {formError && <ErrorText>{formError}</ErrorText>}
          <FormField label="Código" htmlFor="code">
            <Input
              id="code"
              required
              pattern="[A-Za-z0-9-]+"
              title="Apenas letras, números e hífens"
              value={form.code}
              onChange={(event) => setForm((f) => ({ ...f, code: event.target.value }))}
            />
          </FormField>
          <FormRow>
            <FormField label="Tipo" htmlFor="type">
              <Select
                id="type"
                value={form.type}
                onChange={(event) => setForm((f) => ({ ...f, type: event.target.value as CouponType }))}
              >
                <option value="percentual">Percentual</option>
                <option value="valor_fixo">Valor fixo</option>
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
            <FormField label="Limite de uso" htmlFor="usageLimit">
              <Input
                id="usageLimit"
                type="number"
                value={form.usageLimit}
                onChange={(event) => setForm((f) => ({ ...f, usageLimit: event.target.value }))}
              />
            </FormField>
            <FormField label="Validade" htmlFor="expiresAt">
              <Input
                id="expiresAt"
                type="date"
                value={form.expiresAt}
                onChange={(event) => setForm((f) => ({ ...f, expiresAt: event.target.value }))}
              />
            </FormField>
          </FormRow>
          <FormActions>
            <Button type="button" $variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar Cupom"}
            </Button>
          </FormActions>
        </Form>
      </Modal>
    </>
  );
}
