/**
 * Local dev seed — populates Postgres with the same catalog the frontend
 * mock data already used (Fase 17), so the storefront/admin look the same
 * after switching from mock data to the real API (Fase 18).
 *
 * Usage:
 *   npm run seed         — connects using DB_* from backend/.env (DB_HOST=localhost).
 *                           Only works if nothing else is bound to localhost:5432 —
 *                           if you also have a native/local Postgres running on 5432
 *                           alongside the Docker one, this will silently seed the
 *                           WRONG database. Verify with `curl localhost:3000/products`
 *                           afterwards.
 *   npm run seed:docker  — copies this script into the running `essenceperfumes-backend-1`
 *                           container and runs it there (DB_HOST=postgres, the Docker
 *                           service name) — always hits the right database when the
 *                           stack is run via `docker compose up`. Prefer this one.
 *
 * Idempotent: safe to run multiple times (upserts by unique key).
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const bcrypt = require("bcrypt");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.trim().match(/^([^#=]+)=(.*)$/);
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}
loadEnv();

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

const PRODUCTS = [
  {
    slug: "essence-legacy",
    name: "Essence Legacy",
    description: "Timeless elegance for those who leave a mark.",
    price: 195,
    family: "amadeirado",
    notes: ["Bergamot", "Pink Pepper", "Cardamom", "Jasmine", "Lavender", "Iris", "Amber", "Patchouli", "Sandalwood", "Musk"],
    collection: "Timeless Collection",
    stock: 42,
  },
  {
    slug: "essence-botanical",
    name: "Essence Botanical",
    description: "A celebration of nature's purest notes.",
    price: 195,
    family: "floral",
    notes: ["Green Leaves", "Bergamot", "Mint", "Lily of the Valley", "Jasmine", "Violet", "Vetiver", "Musk", "Cedar"],
    collection: "Botanical Collection",
    stock: 18,
  },
  {
    slug: "essence-rose",
    name: "Essence Rose",
    description: "A romantic bouquet for the unforgettable moments.",
    price: 185,
    family: "floral",
    notes: ["Pink Pepper", "Bergamot", "Litchi", "Rose", "Peony", "Lily of the Valley", "Musk", "Cedar", "Amber"],
    collection: "Rose Collection",
    stock: 65,
  },
  {
    slug: "essence-midnight",
    name: "Essence Midnight",
    description: "A bold signature for the night.",
    price: 195,
    family: "oriental",
    notes: ["Black Pepper", "Bergamot", "Saffron", "Oud", "Rose", "Leather", "Amber", "Vanilla", "Sandalwood"],
    collection: "Midnight Collection",
    stock: 30,
  },
  {
    slug: "essence-vetiver",
    name: "Essence Vetiver",
    description: "An earthy, aromatic classic.",
    price: 195,
    family: "amadeirado",
    notes: ["Bergamot", "Grapefruit", "Petitgrain", "Vetiver", "Geranium", "Pepper", "Cedar", "Oakmoss", "Musk"],
    collection: "Vetiver Collection",
    stock: 5,
  },
  {
    slug: "essence-aura",
    name: "Essence Aura",
    description: "A soft, musky signature.",
    price: 205,
    family: "floral",
    notes: ["Pear", "Pink Pepper", "Mandarin", "White Musk", "Jasmine", "Iris", "Ambrette", "Sandalwood", "Vanilla"],
    collection: "Aura Collection",
    stock: 0,
  },
];

const ADMIN = { name: "Admin Essence", email: "admin@essenceperfumes.com", password: "Admin@123" };
const CUSTOMERS = [
  { name: "Mariana Silva", email: "mariana.silva@example.com", password: "Cliente@123" },
  { name: "Lucas Oliveira", email: "lucas.oliveira@example.com", password: "Cliente@123" },
];

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "essence_perfumes",
  });
  await client.connect();

  const { rows: [brand] } = await client.query(
    `INSERT INTO brands (name) VALUES ($1)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    ["Essence Perfumes"],
  );

  const categoryIds = {};
  for (const collection of [...new Set(PRODUCTS.map((p) => p.collection))]) {
    const slug = slugify(collection);
    const { rows: [category] } = await client.query(
      `INSERT INTO categories (name, slug) VALUES ($1, $2)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [collection, slug],
    );
    categoryIds[collection] = category.id;
  }

  for (const product of PRODUCTS) {
    const sku = product.slug.replace("essence-", "ESS-").toUpperCase();
    const { rows: [row] } = await client.query(
      `INSERT INTO products (name, sku, slug, description, price, "brandId", "categoryId", "volumeMl", "olfactoryFamily", notes, "isFeatured", "isActive")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, true)
       ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, description = EXCLUDED.description
       RETURNING id`,
      [
        product.name,
        sku,
        product.slug,
        product.description,
        product.price.toFixed(2),
        brand.id,
        categoryIds[product.collection],
        "100",
        product.family,
        product.notes,
      ],
    );

    await client.query(
      `INSERT INTO stock ("productId", quantity, "reservedQuantity", "minQuantity")
       VALUES ($1, $2, 0, 15)
       ON CONFLICT ("productId") DO UPDATE SET quantity = EXCLUDED.quantity`,
      [row.id, product.stock],
    );
  }

  const adminHash = await bcrypt.hash(ADMIN.password, SALT_ROUNDS);
  await client.query(
    `INSERT INTO users (name, email, "passwordHash", role) VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET role = 'admin'`,
    [ADMIN.name, ADMIN.email, adminHash],
  );

  for (const customer of CUSTOMERS) {
    const hash = await bcrypt.hash(customer.password, SALT_ROUNDS);
    await client.query(
      `INSERT INTO users (name, email, "passwordHash", role) VALUES ($1, $2, $3, 'cliente')
       ON CONFLICT (email) DO NOTHING`,
      [customer.name, customer.email, hash],
    );
  }

  await client.end();

  console.log("Seed concluído.");
  console.log(`Admin:    ${ADMIN.email} / ${ADMIN.password}`);
  console.log(`Cliente:  ${CUSTOMERS[0].email} / ${CUSTOMERS[0].password}`);
}

main().catch((error) => {
  console.error("Seed falhou:", error);
  process.exit(1);
});
