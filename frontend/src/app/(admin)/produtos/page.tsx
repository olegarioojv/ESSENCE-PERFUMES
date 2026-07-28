"use client";

import { useMemo, useState, type FormEvent } from "react";
import styled from "styled-components";
import AdminHeader from "@/components/admin/AdminHeader";
import { Panel, PanelHeader, PanelTitle } from "@/components/admin/Panel";
import { Table, TableHeadRow, HeadCell, Row, Cell } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import Button from "@/components/form/Button";
import FormField, { Input, Select } from "@/components/form/FormField";
import Textarea from "@/components/form/Textarea";
import Modal from "@/components/ui/Modal";
import { EditIcon, PlusIcon, TrashIcon } from "@/components/icons/Icons";
import { adminProducts, type AdminProduct } from "@/lib/data/mockAdmin";
import { formatPriceBRL } from "@/lib/format";

const FilterBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  input {
    flex: 1;
  }
`;

const Swatch = styled.div<{ $from: string; $to: string }>`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: linear-gradient(135deg, ${({ $from }) => $from}, ${({ $to }) => $to});
  flex-shrink: 0;
`;

const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
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

const statusOptions: AdminProduct["status"][] = ["ativo", "inativo"];

const emptyForm = {
  name: "",
  sku: "",
  collection: "",
  description: "",
  price: "",
  stock: "",
};

export default function ProdutosPage() {
  const [products, setProducts] = useState<AdminProduct[]>(adminProducts);
  const [search, setSearch] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const collections = useMemo(
    () => Array.from(new Set(products.map((product) => product.collection).filter(Boolean))) as string[],
    [products],
  );

  const filtered = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCollection = collectionFilter === "todas" || product.collection === collectionFilter;
    const matchesStatus = statusFilter === "todos" || product.status === statusFilter;
    return matchesSearch && matchesCollection && matchesStatus;
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const newProduct: AdminProduct = {
      slug: `essence-${form.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      name: form.name,
      description: form.description,
      price: Number(form.price) || 0,
      volumeMl: 100,
      swatch: ["#D9B98C", "#8A6A3B"],
      collection: form.collection,
      sku: form.sku || `ESS-${Date.now()}`,
      stock: Number(form.stock) || 0,
      status: "ativo",
    };
    setProducts((current) => [newProduct, ...current]);
    setForm(emptyForm);
    setModalOpen(false);
  }

  function handleDelete(slug: string) {
    setProducts((current) => current.filter((product) => product.slug !== slug));
  }

  return (
    <>
      <AdminHeader title="Produtos" subtitle="Gerencie o catálogo de perfumes da loja." />

      <Panel>
        <PanelHeader>
          <PanelTitle>Catálogo</PanelTitle>
          <Button type="button" onClick={() => setModalOpen(true)}>
            <PlusIcon /> Novo Produto
          </Button>
        </PanelHeader>

        <FilterBar>
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select value={collectionFilter} onChange={(event) => setCollectionFilter(event.target.value)}>
            <option value="todas">Todas as coleções</option>
            {collections.map((collection) => (
              <option key={collection} value={collection}>
                {collection}
              </option>
            ))}
          </Select>
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="todos">Todos os status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === "ativo" ? "Ativo" : "Inativo"}
              </option>
            ))}
          </Select>
        </FilterBar>

        <Table>
          <TableHeadRow $columns="2.5fr 1fr 1.5fr 1fr 1fr 1fr 0.7fr">
            <HeadCell>Produto</HeadCell>
            <HeadCell>SKU</HeadCell>
            <HeadCell>Coleção</HeadCell>
            <HeadCell>Preço</HeadCell>
            <HeadCell>Estoque</HeadCell>
            <HeadCell>Status</HeadCell>
            <HeadCell>Ações</HeadCell>
          </TableHeadRow>
          {filtered.map((product) => (
            <Row key={product.slug} $columns="2.5fr 1fr 1.5fr 1fr 1fr 1fr 0.7fr">
              <Cell>
                <NameCell>
                  <Swatch $from={product.swatch[0]} $to={product.swatch[1]} />
                  {product.name}
                </NameCell>
              </Cell>
              <Cell>{product.sku}</Cell>
              <Cell>{product.collection}</Cell>
              <Cell>{formatPriceBRL(product.price)}</Cell>
              <Cell>{product.stock}</Cell>
              <Cell>
                <StatusBadge $tone={product.status === "ativo" ? "success" : "pale"}>
                  {product.status === "ativo" ? "Ativo" : "Inativo"}
                </StatusBadge>
              </Cell>
              <Cell>
                <Actions>
                  <button type="button" aria-label="Editar">
                    <EditIcon />
                  </button>
                  <button type="button" aria-label="Excluir" onClick={() => handleDelete(product.slug)}>
                    <TrashIcon />
                  </button>
                </Actions>
              </Cell>
            </Row>
          ))}
        </Table>
      </Panel>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Produto">
        <Form onSubmit={handleSubmit}>
          <FormField label="Nome" htmlFor="name">
            <Input
              id="name"
              required
              value={form.name}
              onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
            />
          </FormField>
          <FormField label="Descrição" htmlFor="description">
            <Textarea
              id="description"
              value={form.description}
              onChange={(event) => setForm((f) => ({ ...f, description: event.target.value }))}
            />
          </FormField>
          <FormRow>
            <FormField label="Preço (R$)" htmlFor="price">
              <Input
                id="price"
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(event) => setForm((f) => ({ ...f, price: event.target.value }))}
              />
            </FormField>
            <FormField label="Estoque" htmlFor="stock">
              <Input
                id="stock"
                type="number"
                required
                value={form.stock}
                onChange={(event) => setForm((f) => ({ ...f, stock: event.target.value }))}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="SKU" htmlFor="sku">
              <Input
                id="sku"
                value={form.sku}
                onChange={(event) => setForm((f) => ({ ...f, sku: event.target.value }))}
              />
            </FormField>
            <FormField label="Coleção" htmlFor="collection">
              <Input
                id="collection"
                value={form.collection}
                onChange={(event) => setForm((f) => ({ ...f, collection: event.target.value }))}
              />
            </FormField>
          </FormRow>
          <FormActions>
            <Button type="button" $variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Produto</Button>
          </FormActions>
        </Form>
      </Modal>
    </>
  );
}
