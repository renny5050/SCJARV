CREATE TABLE "Tb_estudiant" (
  "codigo_estud" SERIAL PRIMARY KEY,
  "primer_nombr" varchar(20),
  "segundo_nomb" varchar(20),
  "primer_apell" varchar(20),
  "segundo_apellido" varchar(20),
  "fecha_nacimiento" date(10),
  "sexo" char(1),
  "nacionalidad" char(1),
  "tip_sangrees" boolean,
  "grupo_sangui" char(2),
  "lugar_nacimi" text,
  "cedu_escolar" varchar(14),
  "status_estud" boolean,
  "codigo_repre" int(3),
  "codigo_padre" int(3),
  "codigo_madre" int(3),
  "cod_contEmer" int(3),
  "cod_amSocFam" int(3),
  "cod_antePren" int(3),
  "cod_probNace" int(3)
);

CREATE TABLE "Tb_represent" (
  "codigo_repre" SERIAL PRIMARY KEY,
  "parentesco_r" varchar(20),
  "telefon_casa" varchar(12),
  "codigo_perso" int(3)
);

CREATE TABLE "Tb_madreNino" (
  "codigo_madre" SERIAL PRIMARY KEY,
  "codigo_perso" int(3)
);

CREATE TABLE "Tb_padreNino" (
  "codigo_padre" SERIAL PRIMARY KEY,
  "codigo_perso" int(3)
);

CREATE TABLE "Tb_cont_emer" (
  "cod_contEmer" SERIAL PRIMARY KEY,
  "codigo_perso" int(3)
);

CREATE TABLE "Tb_nupersona" (
  "codigo_perso" SERIAL PRIMARY KEY,
  "primer_nombr" varchar(20),
  "segundo_nomb" varchar(20),
  "primer_apell" varchar(20),
  "segund_apell" varchar(20),
  "cedula_perso" varchar(10),
  "tip_sangrees" boolean,
  "cedula" varchar(10),
  "grupo_sangui" char(2),
  "fech_nacimie" date,
  "nacionalidad" varchar(1),
  "correo_perso" varchar(30),
  "direcc_perso" text,
  "status_perso" boolean
);

CREATE TABLE "Tb_telefonop" (
  "cod_telefono" SERIAL PRIMARY KEY,
  "prin_telefono" varchar(12),
  "sec_telefono" varchar(12),
  "cas_telefono" varchar(12),
  "codigo_perso" int(3)
);

CREATE TABLE "Tb_am_so_fam" (
  "cod_amSocFam" SERIAL PRIMARY KEY,
  "pers_amSoFam" int,
  "numero_ninos" int,
  "nume_adultos" int,
  "cod_caracter" int(3),
  "cod_tenencia" int(3)
);

CREATE TABLE "Tb_caracteri" (
  "cod_caracter" SERIAL PRIMARY KEY,
  "nombre_carac" varchar(30)
);

CREATE TABLE "Tb_tenencia" (
  "cod_tenencia" SERIAL PRIMARY KEY,
  "nombre_tenen" varchar(15)
);

CREATE TABLE "Tb_ante_pren" (
  "cod_antePren" SERIAL PRIMARY KEY,
  "enfe_madreEm" varchar(35),
  "cod_codiPart" varchar(1),
  "edad_maParto" char(2),
  "peso_ninoNac" char(3),
  "tall_ninoNac" char(4),
  "medi_contPre" char(30)
);

CREATE TABLE "Tb_codicPart" (
  "cod_codiPart" SERIAL PRIMARY KEY,
  "nom_condPart" varchar(15)
);

CREATE TABLE "Tb_probl_nac" (
  "cod_probNace" SERIAL PRIMARY KEY,
  "edad_caminar" varchar(1),
  "edad_nhablar" varchar(1),
  "mano_dominan" varchar(10),
  "cod_enfePade" int(3)
);

CREATE TABLE "Tb_enferPade" (
  "cod_enfePade" SERIAL PRIMARY KEY,
  "nom_enfePade" varchar(30)
);

CREATE TABLE "Tb_nPersonal" (
  "cod_personal" SERIAL PRIMARY KEY,
  "fecha_entrad" date,
  "fecha_salida" date,
  "codigo_cargo" int(3),
  "codigo_perso" int(3)
);

CREATE TABLE "Tabla_nCargo" (
  "codigo_cargo" SERIAL PRIMARY KEY,
  "nombre_cargo" varchar(10)
);

CREATE TABLE "Tb_nuSeccion" (
  "codigo_secci" SERIAL PRIMARY KEY,
  "nombre_secci" varchar(10)
);

CREATE TABLE "Tb_inscripci" (
  "cod_inscripc" SERIAL PRIMARY KEY,
  "cod_anoSecci" int(3),
  "codigo_estud" int(3),
  "entra_tardia" date,
  "salida_tempr" date
);

CREATE TABLE "Tb_doceSecci" (
  "cod_doceSecc" SERIAL PRIMARY KEY,
  "cod_anoSecci" int(3),
  "codigo_perso" int(3)
);

CREATE TABLE "Tb_anoSeccio" (
  "cod_anoSecci" SERIAL PRIMARY KEY,
  "ano_Seccione" char(1),
  "codigo_secci" int(3)
);

CREATE TABLE "Tb_colaborac" (
  "cod_colabora" SERIAL PRIMARY KEY,
  "cod_inscripc" int(3),
  "fecha_dPagos" date,
  "monto_dPagoS" varchar(8)
);

ALTER TABLE "Tb_estudiant" ADD FOREIGN KEY ("cod_amSocFam") REFERENCES "Tb_am_so_fam" ("cod_amSocFam");

ALTER TABLE "Tb_estudiant" ADD FOREIGN KEY ("codigo_repre") REFERENCES "Tb_represent" ("codigo_repre");

ALTER TABLE "Tb_estudiant" ADD FOREIGN KEY ("codigo_madre") REFERENCES "Tb_madreNino" ("codigo_madre");

ALTER TABLE "Tb_estudiant" ADD FOREIGN KEY ("codigo_padre") REFERENCES "Tb_padreNino" ("codigo_padre");

ALTER TABLE "Tb_estudiant" ADD FOREIGN KEY ("cod_contEmer") REFERENCES "Tb_cont_emer" ("cod_contEmer");

ALTER TABLE "Tb_represent" ADD FOREIGN KEY ("codigo_perso") REFERENCES "Tb_nupersona" ("codigo_perso");

ALTER TABLE "Tb_padreNino" ADD FOREIGN KEY ("codigo_perso") REFERENCES "Tb_nupersona" ("codigo_perso");

ALTER TABLE "Tb_madreNino" ADD FOREIGN KEY ("codigo_perso") REFERENCES "Tb_nupersona" ("codigo_perso");

ALTER TABLE "Tb_cont_emer" ADD FOREIGN KEY ("codigo_perso") REFERENCES "Tb_nupersona" ("codigo_perso");

ALTER TABLE "Tb_nPersonal" ADD FOREIGN KEY ("codigo_perso") REFERENCES "Tb_nupersona" ("codigo_perso");

ALTER TABLE "Tb_am_so_fam" ADD FOREIGN KEY ("cod_caracter") REFERENCES "Tb_caracteri" ("cod_caracter");

ALTER TABLE "Tb_am_so_fam" ADD FOREIGN KEY ("cod_tenencia") REFERENCES "Tb_tenencia" ("cod_tenencia");

ALTER TABLE "Tb_probl_nac" ADD FOREIGN KEY ("cod_enfePade") REFERENCES "Tb_enferPade" ("cod_enfePade");

ALTER TABLE "Tb_estudiant" ADD FOREIGN KEY ("cod_probNace") REFERENCES "Tb_probl_nac" ("cod_probNace");

ALTER TABLE "Tb_estudiant" ADD FOREIGN KEY ("cod_antePren") REFERENCES "Tb_ante_pren" ("cod_antePren");

ALTER TABLE "Tb_colaborac" ADD FOREIGN KEY ("cod_inscripc") REFERENCES "Tb_inscripci" ("cod_inscripc");

ALTER TABLE "Tb_doceSecci" ADD FOREIGN KEY ("cod_anoSecci") REFERENCES "Tb_anoSeccio" ("cod_anoSecci");

ALTER TABLE "Tb_anoSeccio" ADD FOREIGN KEY ("codigo_secci") REFERENCES "Tb_nuSeccion" ("codigo_secci");

ALTER TABLE "Tb_inscripci" ADD FOREIGN KEY ("codigo_estud") REFERENCES "Tb_estudiant" ("codigo_estud");

ALTER TABLE "Tb_inscripci" ADD FOREIGN KEY ("cod_anoSecci") REFERENCES "Tb_anoSeccio" ("cod_anoSecci");

ALTER TABLE "Tb_telefonop" ADD FOREIGN KEY ("codigo_perso") REFERENCES "Tb_nupersona" ("codigo_perso");

ALTER TABLE "Tb_nPersonal" ADD FOREIGN KEY ("codigo_cargo") REFERENCES "Tabla_nCargo" ("codigo_cargo");

ALTER TABLE "Tb_doceSecci" ADD FOREIGN KEY ("codigo_perso") REFERENCES "Tb_nupersona" ("codigo_perso");

ALTER TABLE "Tb_ante_pren" ADD FOREIGN KEY ("cod_codiPart") REFERENCES "Tb_codicPart" ("cod_codiPart");
