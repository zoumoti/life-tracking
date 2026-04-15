-- import-data.sql
-- Import finance data into Supabase A (Life Tracker)
-- user_id remapped to: b7cd0ea4-9480-4264-8e78-9f22a6ea6e50

-- ============================================================
-- 1. Accounts (must be first — transactions reference them)
-- ============================================================
INSERT INTO accounts (id, user_id, name, icon, color, balance, "createdAt") VALUES
  ('1774606708706-srdchwt', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'Livret A', '🏦', '#8b5cf6', 833.76, '2026-03-27T10:18:28.706Z'),
  ('1774606736757-ysp3gkm', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'Livret Jeune', '📈', '#22c55e', 1600, '2026-03-27T10:18:56.757Z'),
  ('1774606753460-u94cs85', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'Compte Pro', '💼', '#f43f5e', 1249.01, '2026-03-27T10:19:13.460Z'),
  ('1774606628093-ossd2m2', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'Compte courant', '💳', '#6366f1', 178.75, '2026-03-27T10:17:08.093Z');

-- ============================================================
-- 2. Finance Categories
-- ============================================================
INSERT INTO "financeCategories" (id, user_id, name, icon, "appliesTo", "isDefault", "createdAt") VALUES
  ('default-11', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'Other', '📦', 'both', true, '2026-03-14T16:05:15.382Z'),
  ('default-0', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'Repas obligatoire', '🍔', 'expense', false, '2026-03-14T16:05:15.382Z'),
  ('default-7', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'Economies', '🏦', 'both', false, '2026-03-14T16:05:15.382Z'),
  ('default-10', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'Investissement', '📈', 'both', false, '2026-03-14T16:05:15.382Z'),
  ('default-2', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'Transport', '🚗', 'expense', true, '2026-03-14T16:05:15.382Z'),
  ('default-3', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'Business', '💼', 'both', true, '2026-03-14T16:05:15.382Z'),
  ('default-1', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'Snacks', '🍺', 'expense', false, '2026-03-14T16:05:15.382Z'),
  ('default-4', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'Divertissement', '🎬', 'expense', false, '2026-03-14T16:05:15.382Z'),
  ('1774605086951-pfx3ild', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'Sorties resto/fast food', '🍔', 'expense', false, '2026-03-27T09:51:26.951Z'),
  ('default-6', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'Shopping', '🛍️', 'expense', false, '2026-03-14T16:05:15.382Z'),
  ('default-8', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'Salaire', '💰', 'income', false, '2026-03-14T16:05:15.382Z'),
  ('default-5', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'Santé', '💊', 'both', false, '2026-03-14T16:05:15.382Z'),
  ('1774605819743-crj1dr5', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'Aide familiale', '💰', 'income', false, '2026-03-27T10:03:39.743Z'),
  ('1774605831383-w8g3tsp', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'Remboursement reçu', '💰', 'income', false, '2026-03-27T10:03:51.383Z');

-- ============================================================
-- 3. Transactions
-- ============================================================
INSERT INTO transactions (id, user_id, type, amount, category, "accountId", "toAccountId", date, description, "createdAt") VALUES
  ('899e8c38-8c6f-4c39-8c49-abaab7009f8e', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'income', 333.08, 'Business', '1774606753460-u94cs85', NULL, '2026-04-01', 'Commission Hugo Mars', '2026-04-03T12:36:47.892Z'),
  ('6a0b4688-18ea-46eb-afb1-b5ca33babaaa', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 30, 'Santé', '1774606628093-ossd2m2', NULL, '2026-04-01', 'Orange bleue', '2026-04-03T12:37:43.945Z'),
  ('464a868e-3821-4945-abbc-5cff548198a6', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'income', 100, 'Aide familiale', '1774606628093-ossd2m2', NULL, '2026-04-01', 'Virement maman début de mois', '2026-04-03T12:38:15.921Z'),
  ('7ced6f22-2db2-4f52-ab70-23e7bf1ac8c4', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'income', 21.3, 'Remboursement reçu', '1774606628093-ossd2m2', NULL, '2026-04-01', 'Remboursement cookies', '2026-04-03T12:38:49.110Z'),
  ('966729d4-e695-4da0-a8bc-f5fcae3dd686', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 4.65, 'Repas obligatoire', '1774606628093-ossd2m2', NULL, '2026-04-01', 'Repas midi', '2026-04-03T12:39:09.544Z'),
  ('d86969db-bd08-484c-9d1c-67a669eb2719', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'income', 70, 'Aide familiale', '1774606628093-ossd2m2', NULL, '2026-04-01', 'Virement papa début de mois', '2026-04-03T12:39:57.170Z'),
  ('3710a696-9770-4fba-9d42-1e1e2c7e003a', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 1.7, 'Snacks', '1774606628093-ossd2m2', NULL, '2026-04-01', 'Distributeur fac', '2026-04-03T12:40:24.430Z'),
  ('86dfd056-3df3-4884-90d0-6e449e343745', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 12, 'Divertissement', '1774606628093-ossd2m2', NULL, '2026-04-02', 'Gala SI', '2026-04-03T12:40:49.891Z'),
  ('03093537-5f3c-4dbe-b8b1-0d694907d3c4', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 3.3, 'Repas obligatoire', '1774606628093-ossd2m2', NULL, '2026-04-02', 'RU', '2026-04-03T12:41:09.911Z'),
  ('63995b7e-bd06-446e-a600-f00d679dc717', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 0.5, 'Snacks', '1774606628093-ossd2m2', NULL, '2026-04-02', 'Café fac', '2026-04-03T12:41:33.838Z'),
  ('5dc288c4-24e1-4975-a4c7-6b0354ff7100', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 3.3, 'Repas obligatoire', '1774606628093-ossd2m2', NULL, '2026-04-01', 'RU', '2026-04-03T12:42:03.981Z'),
  ('daeb9172-ac7d-49b3-93b9-a6d3df4deb7b', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 1.52, 'Snacks', '1774606628093-ossd2m2', NULL, '2026-04-01', 'Lidl', '2026-04-03T12:42:33.413Z'),
  ('eb2ba23f-b407-4253-a215-fd40d6f16231', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 21.3, 'Snacks', '1774606628093-ossd2m2', NULL, '2026-04-01', 'Cookies L''atelier des cookies', '2026-04-03T12:43:10.229Z'),
  ('792c0c0f-871d-45b6-be2b-e9e4d7c49e5f', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 3.16, 'Repas obligatoire', '1774606628093-ossd2m2', NULL, '2026-04-02', 'Repas midi', '2026-04-03T12:43:34.000Z'),
  ('dffc94cc-29b7-442e-a5e5-a2a77fd4a794', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 0.97, 'Snacks', '1774606628093-ossd2m2', NULL, '2026-04-03', 'Super U', '2026-04-03T12:43:56.515Z'),
  ('87e1b754-0094-40e4-a335-5060b3d2a08b', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 3.3, 'Repas obligatoire', '1774606628093-ossd2m2', NULL, '2026-04-03', 'RU', '2026-04-03T12:44:09.506Z'),
  ('6df46b10-d97e-49f5-bd65-a447bd052598', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 75.06, 'Transport', '1774606628093-ossd2m2', NULL, '2026-04-04', 'Essence', '2026-04-04T18:45:14.330Z'),
  ('9a929862-c95a-4143-b035-56ade12cbcc0', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'income', 1000, 'Aide familiale', '1774606628093-ossd2m2', NULL, '2026-04-07', 'Chèque papi mamie', '2026-04-07T10:37:47.446Z'),
  ('75f1845c-0256-4e2f-8d22-6bc9c418ba86', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 3.4, 'Snacks', '1774606628093-ossd2m2', NULL, '2026-04-07', 'Petit dèj super U', '2026-04-07T12:23:32.802Z'),
  ('e0539d38-2055-4532-aa37-c8fa905d9928', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 14.4, 'Sorties resto/fast food', '1774606628093-ossd2m2', NULL, '2026-04-07', 'Poutine Bros', '2026-04-07T12:23:48.623Z'),
  ('798cc390-af06-46a3-8984-935588af6494', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 0.5, 'Snacks', '1774606628093-ossd2m2', NULL, '2026-04-07', 'Café fac', '2026-04-07T12:24:03.969Z'),
  ('523e7677-1dd5-42ec-831e-c4024f291b1c', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 5.21, 'Business', '1774606628093-ossd2m2', NULL, '2026-04-06', 'Open AI', '2026-04-07T12:24:52.292Z'),
  ('346c01b0-897f-4f2e-b78f-8b5c7d3e608a', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 0.5, 'Snacks', '1774606628093-ossd2m2', NULL, '2026-04-06', 'Café fac', '2026-04-07T12:25:07.836Z'),
  ('3ed1970e-a64b-4063-87a9-2f699f5ca06c', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'expense', 3.2, 'Other', '1774606628093-ossd2m2', NULL, '2026-04-06', 'Frais bancaire', '2026-04-07T12:25:56.535Z'),
  ('1775564877745-iyv82gc', 'b7cd0ea4-9480-4264-8e78-9f22a6ea6e50', 'transfer', 800, '', '1774606628093-ossd2m2', '1774606708706-srdchwt', '2026-04-07', '', '2026-04-07T12:27:57.745Z');
