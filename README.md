# ZAVRÉN Store — Cloudflare Pages + Functions

This package keeps the supplied storefront design and admin panel, repairs the admin size checkboxes, and adds the backend required for real product management, image storage, and cash-on-delivery and manual bank-transfer orders.

## Important bindings and secrets

Create a Cloudflare D1 database and an R2 bucket, then bind them to this Pages project:

- D1 binding name: `DB`
- R2 binding name: `IMAGES`
- Secret `ADMIN_USERNAME`: choose your private admin username (the admin form currently pre-fills `admin`; change that default if desired)
- Secret `ADMIN_PASSWORD`: choose a strong, unique password
- Secret `SESSION_SECRET`: a random secret of at least 32 characters

Do not put secrets in HTML, GitHub source, or `wrangler.toml`.

## Deploy steps

1. Upload the contents of this folder to the root of your GitHub repository `muhammadaqeel5107/zavren-store` (replace the old `index.html`; keep `admin.html`; add the `functions/` folder and `schema.sql`).
2. In Cloudflare Pages, connect that repository. Framework preset: **None**. Build command: leave blank. Build output directory: `/` (or `.`). Root directory: `/`.
3. Create a D1 database in Cloudflare dashboard. Run the contents of `schema.sql` against that database (if it already exists, re-run the updated schema; its CREATE TABLE statements are safe) (D1 Console → Query).
4. In Pages → your project → Settings → Functions → D1 database bindings, bind your database as `DB`.
5. In Pages → Settings → Functions → R2 bucket bindings, bind your bucket as `IMAGES`.
6. In Pages → Settings → Variables and Secrets, add the three values above as **secrets**. `SESSION_SECRET` can be generated with `openssl rand -hex 32`.
7. Trigger a new deployment after adding bindings/secrets. Pages Functions deploy automatically from the `functions/` directory.
8. Open `/admin.html`, sign in with the username/password you set, add a test product, then place a test COD order from the storefront. Confirm the order appears in the admin Orders tab.

## API routes implemented

- `GET /api/products` — active public products
- `GET /api/settings` — public bank transfer details
- `GET/PUT /api/admin/settings` — admin-editable bank transfer details
- `POST /api/orders` — validates product IDs, sizes and prices server-side; stores COD or manual bank-transfer orders in D1
- `POST /api/admin/login`, `POST /api/admin/logout` — signed HttpOnly admin session cookie
- `GET/POST /api/admin/products`, `PUT/DELETE /api/admin/products/:id`
- `POST /api/admin/upload` — image upload to private R2 binding, served through `/media/*`
- `GET /api/admin/orders`, `PATCH /api/admin/orders/:id`

## Security / operational notes

- Product prices are recalculated from D1 at checkout; browser-provided prices are not trusted.
- Admin session is HttpOnly, Secure, SameSite=Strict and expires after 8 hours.
- Bank transfer is manual: the customer sees the Faisal Bank details at checkout and may enter a transfer reference. The store does not verify transfers automatically and is not connected to a payment gateway. Verify funds in your bank account before dispatch. The site does not integrate a courier, SMS/email notification, inventory deduction, or automated shipping labels.
- Protect the GitHub repository if you do not want the source public. Never commit secrets.
- Before taking live orders, perform the test flow above and add your customer-support phone/WhatsApp details to the contact section.
