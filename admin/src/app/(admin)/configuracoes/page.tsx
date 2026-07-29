"use client";

import { useEffect, useState, type FormEvent } from "react";
import styled from "styled-components";
import AdminHeader from "@/components/admin/AdminHeader";
import { Panel } from "@/components/admin/Panel";
import { StatusBadge } from "@/components/admin/StatusBadge";
import Button from "@/components/form/Button";
import FormField, { Checkbox, CheckboxRow, Input } from "@/components/form/FormField";
import Modal from "@/components/ui/Modal";
import { PlusIcon } from "@/components/icons/Icons";
import { mockStoreSettings } from "@/lib/data/mockAdmin";
import { formatPriceBRL } from "@/lib/format";
import {
  createAdminUser,
  fetchAdminUsers,
  parseApiError,
  type ApiUser,
} from "@/lib/api/adminUsers";

const Layout = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const TabNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
`;

const TabButton = styled.button<{ $active: boolean }>`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  background: ${({ theme, $active }) => ($active ? theme.colors.surfaceAlt : "transparent")};
  color: ${({ theme, $active }) => ($active ? theme.colors.gold : theme.colors.ink)};
  border-left: 2px solid ${({ theme, $active }) => ($active ? theme.colors.gold : "transparent")};
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  max-width: 420px;
`;

const CheckList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const UserRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const UserInfo = styled.div`
  strong {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const UsersHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SaveBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const SavedMessage = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.success};
`;

const tabs = [
  { id: "geral", label: "Geral" },
  { id: "frete", label: "Frete" },
  { id: "pagamento", label: "Pagamento" },
  { id: "notificacoes", label: "Notificações" },
  { id: "usuarios", label: "Usuários" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("geral");
  const [settings, setSettings] = useState(mockStoreSettings);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "" });
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [tempPasswordMessage, setTempPasswordMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timeout = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timeout);
  }, [saved]);

  useEffect(() => {
    let cancelled = false;
    setUsersLoading(true);
    setUsersError(null);
    fetchAdminUsers()
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((error) => {
        if (!cancelled) setUsersError(parseApiError(error, "Não foi possível carregar os usuários."));
      })
      .finally(() => {
        if (!cancelled) setUsersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSave() {
    setSaved(true);
  }

  function openInvite() {
    setInviteError(null);
    setTempPasswordMessage(null);
    setInviteOpen(true);
  }

  async function handleInvite(event: FormEvent) {
    event.preventDefault();
    setInviteSubmitting(true);
    setInviteError(null);
    try {
      const { user, temporaryPassword } = await createAdminUser(inviteForm);
      setUsers((current) => [...current, user]);
      setInviteForm({ name: "", email: "" });
      setInviteOpen(false);
      setTempPasswordMessage(
        `Usuário "${user.name}" criado com sucesso. Senha temporária: ${temporaryPassword}`,
      );
    } catch (error) {
      setInviteError(parseApiError(error, "Não foi possível criar o usuário."));
    } finally {
      setInviteSubmitting(false);
    }
  }

  return (
    <>
      <AdminHeader title="Configurações" subtitle="Gerencie as configurações da loja." />

      <Panel>
        <Layout>
          <TabNav>
            {tabs.map((tab) => (
              <TabButton key={tab.id} type="button" $active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </TabButton>
            ))}
          </TabNav>

          <div>
            {activeTab === "geral" && (
              <FieldGroup>
                <FormField label="Nome da loja" htmlFor="storeName">
                  <Input
                    id="storeName"
                    value={settings.storeName}
                    onChange={(event) => setSettings((s) => ({ ...s, storeName: event.target.value }))}
                  />
                </FormField>
                <FormField label="E-mail de suporte" htmlFor="supportEmail">
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(event) => setSettings((s) => ({ ...s, supportEmail: event.target.value }))}
                  />
                </FormField>
                <FormField label="Telefone de suporte" htmlFor="supportPhone">
                  <Input
                    id="supportPhone"
                    value={settings.supportPhone}
                    onChange={(event) => setSettings((s) => ({ ...s, supportPhone: event.target.value }))}
                  />
                </FormField>
              </FieldGroup>
            )}

            {activeTab === "frete" && (
              <FieldGroup>
                <FormField label="Frete grátis a partir de (R$)" htmlFor="freeShipping">
                  <Input
                    id="freeShipping"
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(event) =>
                      setSettings((s) => ({ ...s, freeShippingThreshold: Number(event.target.value) }))
                    }
                  />
                </FormField>
                <FormField label="Frete padrão (R$)" htmlFor="standardShipping">
                  <Input
                    id="standardShipping"
                    type="number"
                    step="0.01"
                    value={settings.standardShipping}
                    onChange={(event) =>
                      setSettings((s) => ({ ...s, standardShipping: Number(event.target.value) }))
                    }
                  />
                </FormField>
                <span>
                  Atual: acima de {formatPriceBRL(settings.freeShippingThreshold)} o frete é grátis; abaixo disso,
                  {" "}
                  {formatPriceBRL(settings.standardShipping)}.
                </span>
              </FieldGroup>
            )}

            {activeTab === "pagamento" && (
              <CheckList>
                <CheckboxRow>
                  <Checkbox
                    checked={settings.paymentMethods.cartao}
                    onChange={(event) =>
                      setSettings((s) => ({
                        ...s,
                        paymentMethods: { ...s.paymentMethods, cartao: event.target.checked },
                      }))
                    }
                  />
                  Cartão de crédito
                </CheckboxRow>
                <CheckboxRow>
                  <Checkbox
                    checked={settings.paymentMethods.pix}
                    onChange={(event) =>
                      setSettings((s) => ({
                        ...s,
                        paymentMethods: { ...s.paymentMethods, pix: event.target.checked },
                      }))
                    }
                  />
                  Pix
                </CheckboxRow>
                <CheckboxRow>
                  <Checkbox
                    checked={settings.paymentMethods.boleto}
                    onChange={(event) =>
                      setSettings((s) => ({
                        ...s,
                        paymentMethods: { ...s.paymentMethods, boleto: event.target.checked },
                      }))
                    }
                  />
                  Boleto
                </CheckboxRow>
              </CheckList>
            )}

            {activeTab === "notificacoes" && (
              <CheckList>
                <CheckboxRow>
                  <Checkbox
                    checked={settings.notifications.novoPedido}
                    onChange={(event) =>
                      setSettings((s) => ({
                        ...s,
                        notifications: { ...s.notifications, novoPedido: event.target.checked },
                      }))
                    }
                  />
                  Notificar novo pedido
                </CheckboxRow>
                <CheckboxRow>
                  <Checkbox
                    checked={settings.notifications.estoqueBaixo}
                    onChange={(event) =>
                      setSettings((s) => ({
                        ...s,
                        notifications: { ...s.notifications, estoqueBaixo: event.target.checked },
                      }))
                    }
                  />
                  Notificar estoque baixo
                </CheckboxRow>
                <CheckboxRow>
                  <Checkbox
                    checked={settings.notifications.novaAvaliacao}
                    onChange={(event) =>
                      setSettings((s) => ({
                        ...s,
                        notifications: { ...s.notifications, novaAvaliacao: event.target.checked },
                      }))
                    }
                  />
                  Notificar nova avaliação
                </CheckboxRow>
              </CheckList>
            )}

            {activeTab === "usuarios" && (
              <div>
                <UsersHeader>
                  <strong>Usuários do painel</strong>
                  <Button type="button" onClick={openInvite}>
                    <PlusIcon /> Convidar usuário
                  </Button>
                </UsersHeader>
                {tempPasswordMessage && <SavedMessage>{tempPasswordMessage}</SavedMessage>}
                {usersLoading && <span>Carregando usuários...</span>}
                {usersError && !usersLoading && <span>{usersError}</span>}
                {!usersLoading &&
                  !usersError &&
                  users.map((user) => (
                    <UserRow key={user.id}>
                      <UserInfo>
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </UserInfo>
                      <StatusBadge $tone="gold">Administrador</StatusBadge>
                    </UserRow>
                  ))}
              </div>
            )}

            <SaveBar>
              <Button type="button" onClick={handleSave}>
                Salvar alterações
              </Button>
              {saved && <SavedMessage>Alterações salvas com sucesso.</SavedMessage>}
            </SaveBar>
          </div>
        </Layout>
      </Panel>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Convidar usuário">
        <form onSubmit={handleInvite}>
          <FieldGroup>
            <FormField label="Nome" htmlFor="inviteName">
              <Input
                id="inviteName"
                required
                minLength={2}
                value={inviteForm.name}
                onChange={(event) => setInviteForm((f) => ({ ...f, name: event.target.value }))}
              />
            </FormField>
            <FormField label="E-mail" htmlFor="inviteEmail">
              <Input
                id="inviteEmail"
                type="email"
                required
                value={inviteForm.email}
                onChange={(event) => setInviteForm((f) => ({ ...f, email: event.target.value }))}
              />
            </FormField>
            <span>
              Este painel ainda não possui um fluxo de convite por e-mail: o usuário é criado
              imediatamente com acesso de administrador e uma senha temporária, exibida a você
              após a criação.
            </span>
            {inviteError && <SavedMessage>{inviteError}</SavedMessage>}
            <SaveBar>
              <Button type="button" $variant="secondary" onClick={() => setInviteOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={inviteSubmitting}>
                {inviteSubmitting ? "Criando..." : "Criar usuário"}
              </Button>
            </SaveBar>
          </FieldGroup>
        </form>
      </Modal>
    </>
  );
}
