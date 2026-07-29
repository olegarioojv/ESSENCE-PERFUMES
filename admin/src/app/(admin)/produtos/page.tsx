"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import {
  fetchAdminProducts,
  fetchCategories,
  fetchBrands,
  createProduct,
  deleteProduct,
  parseApiError,
  type AdminProduct,
  type Category,
  type Brand,
} from "@/lib/api/adminProducts";
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

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: 0 0 ${({ theme }) => theme.spacing.md};
`;

const EmptyState = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  padding: ${({ theme }) => theme.spacing.lg} 0;
  text-align: center;
`;

const statusOptions: Array<"ativo" | "inativo"> = ["ativo", "inativo"];

const emptyForm = {
  name: "",
  sku: "",
  categoryId: "",
  brandId: "",
  description: "",
  price: "",
  volumeMl: "",
};

export default function ProdutosPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [productList, categoryList, brandList] = await Promise.all([
        fetchAdminProducts(),
        fetchCategories(),
        fetchBrands(),
      ]);
      setProducts(productList);
      setCategories(categoryList);
      setBrands(brandList);
    } catch (err) {
      setError(parseApiError(err, "Não foi possível carregar os produtos."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const collections = useMemo(
    () => Array.from(new Set(products.map((product) => product.categoryName).filter(Boolean))) as string[],
    [products],
  );

  const filtered = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCollection = collectionFilter === "todas" || product.categoryName === collectionFilter;
    const status = product.isActive ? "ativo" : "inativo";
    const matchesStatus = statusFilter === "todos" || status === statusFilter;
    return matchesSearch && matchesCollection && matchesStatus;
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!form.categoryId || !form.brandId) {
      setFormError("Selecione uma coleção e uma marca.");
      return;
    }
    setSubmitting(true);
    try {
      await createProduct({
        name: form.name,
        sku: form.sku || `ESS-${Date.now()}`,
        description: form.description || undefined,
        price: Number(form.price) || 0,
        brandId: form.brandId,
        categoryId: form.categoryId,
        volumeMl: form.volumeMl ? Number(form.volumeMl) : undefined,
        isActive: true,
      });
      setForm(emptyForm);
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setFormError(parseApiError(err, "Não foi possível criar o produto."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir este produto?")) return;
    try {
      await deleteProduct(id);
      setProducts((current) => current.filter((product) => product.id !== id));
    } catch (err) {
      setError(parseApiError(err, "Não foi possível excluir o produto."));
    }
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

        {error && <ErrorText role="alert">{error}</ErrorText>}

        {loading ? (
          <EmptyState>Carregando produtos...</EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState>Nenhum produto encontrado.</EmptyState>
        ) : (
          <Table>
            <TableHeadRow $columns="2.5fr 1fr 1.5fr 1fr 1fr 0.7fr">
              <HeadCell>Produto</HeadCell>
              <HeadCell>SKU</HeadCell>
              <HeadCell>Coleção</HeadCell>
              <HeadCell>Preço</HeadCell>
              <HeadCell>Status</HeadCell>
              <HeadCell>Ações</HeadCell>
            </TableHeadRow>
            {filtered.map((product) => (
              <Row key={product.id} $columns="2.5fr 1fr 1.5fr 1fr 1fr 0.7fr">
                <Cell>
                  <NameCell>
                    <Swatch $from={product.swatch[0]} $to={product.swatch[1]} />
                    {product.name}
                  </NameCell>
                </Cell>
                <Cell>{product.sku}</Cell>
                <Cell>{product.categoryName ?? "—"}</Cell>
                <Cell>{formatPriceBRL(product.price)}</Cell>
                <Cell>
                  <StatusBadge $tone={product.isActive ? "success" : "pale"}>
                    {product.isActive ? "Ativo" : "Inativo"}
                  </StatusBadge>
                </Cell>
                <Cell>
                  <Actions>
                    <button type="button" aria-label="Editar">
                      <EditIcon />
                    </button>
                    <button type="button" aria-label="Excluir" onClick={() => handleDelete(product.id)}>
                      <TrashIcon />
                    </button>
                  </Actions>
                </Cell>
              </Row>
            ))}
          </Table>
        )}
      </Panel>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Produto">
        <Form onSubmit={handleSubmit}>
          {formError && <ErrorText role="alert">{formError}</ErrorText>}
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
            <FormField label="Volume (ml)" htmlFor="volumeMl">
              <Input
                id="volumeMl"
                type="number"
                value={form.volumeMl}
                onChange={(event) => setForm((f) => ({ ...f, volumeMl: event.target.value }))}
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
            <FormField label="Marca" htmlFor="brandId">
              <Select
                id="brandId"
                required
                value={form.brandId}
                onChange={(event) => setForm((f) => ({ ...f, brandId: event.target.value }))}
              >
                <option value="">Selecione...</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </FormRow>
          <FormField label="Coleção" htmlFor="categoryId">
            <Select
              id="categoryId"
              required
              value={form.categoryId}
              onChange={(event) => setForm((f) => ({ ...f, categoryId: event.target.value }))}
            >
              <option value="">Selecione...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormActions>
            <Button type="button" $variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar Produto"}
            </Button>
          </FormActions>
        </Form>
      </Modal>
    </>
  );
}
