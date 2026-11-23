-- Only executed inside the dedicated mobile-e2e compose project, after Flyway.
BEGIN;
TRUNCATE produit, marque, categorie, univers, attribut RESTART IDENTITY CASCADE;
INSERT INTO marque (id,nom,slug,date_creation,date_maj) VALUES
 (1,'E2E Alpha','e2e-alpha',now(),now()), (2,'E2E Beta','e2e-beta',now(),now());
INSERT INTO categorie (id,nom,slug,position,date_creation,date_maj) VALUES
 (1,'E2E Accessoires','e2e-accessoires',0,now(),now()), (2,'E2E Autres','e2e-autres',1,now(),now());
INSERT INTO univers (id,nom,slug,position,date_creation,date_maj) VALUES
 (1,'E2E Bureau','e2e-bureau',0,now(),now()), (2,'E2E Voyage','e2e-voyage',1,now(),now());
INSERT INTO produit (id,titre,slug,statut,marque_id,categorie_id,tva_id,date_creation,date_maj) VALUES
 (1,'Station d’accueil','e2e-station','PUBLIE',1,1,1,now(),now()),
 (2,'E2E Clavier','e2e-clavier','PUBLIE',2,1,1,now(),now()),
 (3,'E2E Souris','e2e-souris','PUBLIE',1,1,1,now(),now()),
 (4,'E2E Sac','e2e-sac','PUBLIE',2,2,1,now(),now());
INSERT INTO produit_univers VALUES (1,1),(2,1),(3,2),(4,2);
-- 101 is an existing UI recommendation, not an assumed backend ID: create it,
-- then assert its SKU, price and stock through the public product endpoint.
INSERT INTO variante (id,produit_id,sku,prix_achat_ht,prix_vente_ht,poids,stock,seuil_alerte,date_creation,date_maj) VALUES
 (101,1,'E2E-STATION-BASE',40,89,1,20,2,now(),now()),
 (201,1,'E2E-STATION-PLUS',50,99,1,20,2,now(),now()),
 (202,2,'E2E-CLAVIER',20,49,1,20,2,now(),now()),
 (203,3,'E2E-SOURIS',10,29,1,20,2,now(),now()),
 (204,4,'E2E-SAC',10,39,1,20,2,now(),now());
SELECT setval(pg_get_serial_sequence('produit','id'),4);
SELECT setval(pg_get_serial_sequence('variante','id'),204);
SELECT setval(pg_get_serial_sequence('marque','id'),2);
SELECT setval(pg_get_serial_sequence('categorie','id'),2);
SELECT setval(pg_get_serial_sequence('univers','id'),2);
COMMIT;
