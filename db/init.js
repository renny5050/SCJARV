const sqlite3 = require('sqlite3').verbose();

// Conectar/Crear base de datos
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) return console.error(err.message);
  console.log("Conexión exitosa a SQLite");
});

// Crear tablas
const statements = [
`CREATE TABLE IF NOT EXISTS "Tb_nupersona" (
  "codigo_perso" INTEGER PRIMARY KEY,
  "primer_nombr" VARCHAR(20),
  "segundo_nomb" VARCHAR(20),
  "primer_apell" VARCHAR(20),
  "segund_apell" VARCHAR(20),
  "cedula_perso" VARCHAR(10),
  "cedula" VARCHAR(10),
  "fech_nacimie" DATE,
  "nacionalidad" VARCHAR(1),
  "correo_perso" VARCHAR(30),
  "direcc_perso" TEXT,
  "status_perso" BOOLEAN,
  "prin_telefono" VARCHAR(12),
  "sec_telefono" VARCHAR(12),
  "cas_telefono" VARCHAR(12)
);`,

`CREATE TABLE IF NOT EXISTS "Tabla_nCargo" (
  "codigo_cargo" INTEGER PRIMARY KEY,
  "nombre_cargo" VARCHAR(10)
);`,

`CREATE TABLE IF NOT EXISTS "Tb_nuSeccion" (
  "codigo_secci" INTEGER PRIMARY KEY,
  "nombre_secci" VARCHAR(10)
);`,

`CREATE TABLE IF NOT EXISTS "Tb_am_so_fam" (
  "cod_amSocFam" INTEGER PRIMARY KEY,
  "pers_amSoFam" INTEGER,
  "numero_ninos" INTEGER,
  "nume_adultos" INTEGER,
  "tip_caracter" VARCHAR(15),
  "tip_tenencia" VARCHAR(15)
);`,

`CREATE TABLE IF NOT EXISTS "Tb_ante_pren" (
  "cod_antePren" INTEGER PRIMARY KEY,
  "enfe_madreEm" VARCHAR(35),
  "cod_codiPart" VARCHAR(50),
  "edad_maParto" INTEGER,
  "peso_ninoNac" INTEGER,
  "tall_ninoNac" INTEGER,
  "medi_contPre" VARCHAR(30)
);`,

`CREATE TABLE IF NOT EXISTS "Tb_probl_nac" (
  "cod_probNace" INTEGER PRIMARY KEY,
  "edad_caminar" INTEGER,
  "edad_nhablar" INTEGER,
  "mano_dominan" VARCHAR(10),
  "cod_enfePade" TEXT
);`,

`CREATE TABLE IF NOT EXISTS "Tb_represent" (
  "codigo_repre" INTEGER PRIMARY KEY,
  "parentesco_r" VARCHAR(20),
  "codigo_perso" INTEGER,
  FOREIGN KEY ("codigo_perso") REFERENCES "Tb_nupersona" ("codigo_perso")
);`,

`CREATE TABLE IF NOT EXISTS "Tb_madreNino" (
  "codigo_madre" INTEGER PRIMARY KEY,
  "codigo_perso" INTEGER,
  FOREIGN KEY ("codigo_perso") REFERENCES "Tb_nupersona" ("codigo_perso")
);`,

`CREATE TABLE IF NOT EXISTS "Tb_padreNino" (
  "codigo_padre" INTEGER PRIMARY KEY,
  "codigo_perso" INTEGER,
  FOREIGN KEY ("codigo_perso") REFERENCES "Tb_nupersona" ("codigo_perso")
);`,

`CREATE TABLE IF NOT EXISTS "Tb_cont_emer" (
  "cod_contEmer" INTEGER PRIMARY KEY,
  "parentesco_e" VARCHAR(20),
  "codigo_perso" INTEGER,
  FOREIGN KEY ("codigo_perso") REFERENCES "Tb_nupersona" ("codigo_perso")
);`,

`CREATE TABLE IF NOT EXISTS "Tb_nPersonal" (
  "cod_personal" INTEGER PRIMARY KEY,
  "fecha_entrad" DATE,
  "fecha_salida" DATE,
  "codigo_cargo" INTEGER,
  "codigo_perso" INTEGER,
  FOREIGN KEY ("codigo_cargo") REFERENCES "Tabla_nCargo" ("codigo_cargo"),
  FOREIGN KEY ("codigo_perso") REFERENCES "Tb_nupersona" ("codigo_perso")
);`,

`CREATE TABLE IF NOT EXISTS "Tb_anoSeccio" (
  "cod_anoSecci" INTEGER PRIMARY KEY,
  "ano_Seccione" CHAR(1),
  "codigo_secci" INTEGER,
  FOREIGN KEY ("codigo_secci") REFERENCES "Tb_nuSeccion" ("codigo_secci")
);`,

`CREATE TABLE IF NOT EXISTS "Tb_estudiant" (
  "codigo_estud" INTEGER PRIMARY KEY,
  "primer_nombr" VARCHAR(20),
  "segundo_nomb" VARCHAR(20),
  "primer_apell" VARCHAR(20),
  "segundo_apellido" VARCHAR(20),
  "fecha_nacimiento" DATE,
  "sexo" CHAR(1),
  "nacionalidad" CHAR(1),
  "tip_sangrees" BOOLEAN,
  "grupo_sangui" CHAR(2),
  "estad_nacimi" VARCHAR(20),
  "munic_nacimi" TEXT,
  "cedu_escolar" VARCHAR(14),
  "status_estud" BOOLEAN,
  "codigo_repre" INTEGER,
  "codigo_padre" INTEGER,
  "codigo_madre" INTEGER,
  "cod_contEmer" INTEGER,
  "cod_amSocFam" INTEGER,
  "cod_antePren" INTEGER,
  "cod_probNace" INTEGER,
  FOREIGN KEY ("cod_amSocFam") REFERENCES "Tb_am_so_fam" ("cod_amSocFam"),
  FOREIGN KEY ("codigo_repre") REFERENCES "Tb_represent" ("codigo_repre"),
  FOREIGN KEY ("codigo_madre") REFERENCES "Tb_madreNino" ("codigo_madre"),
  FOREIGN KEY ("codigo_padre") REFERENCES "Tb_padreNino" ("codigo_padre"),
  FOREIGN KEY ("cod_contEmer") REFERENCES "Tb_cont_emer" ("cod_contEmer"),
  FOREIGN KEY ("cod_probNace") REFERENCES "Tb_probl_nac" ("cod_probNace"),
  FOREIGN KEY ("cod_antePren") REFERENCES "Tb_ante_pren" ("cod_antePren")
);`,

`CREATE TABLE IF NOT EXISTS "Tb_doceSecci" (
  "cod_doceSecc" INTEGER PRIMARY KEY,
  "cod_anoSecci" INTEGER,
  "codigo_perso" INTEGER,
  FOREIGN KEY ("cod_anoSecci") REFERENCES "Tb_anoSeccio" ("cod_anoSecci"),
  FOREIGN KEY ("codigo_perso") REFERENCES "Tb_nupersona" ("codigo_perso")
);`,

`CREATE TABLE IF NOT EXISTS "Tb_inscripci" (
  "cod_inscripc" INTEGER PRIMARY KEY,
  "cod_anoSecci" INTEGER,
  "codigo_estud" INTEGER,
  "entra_tardia" DATE,
  "salida_tempr" DATE,
  FOREIGN KEY ("cod_anoSecci") REFERENCES "Tb_anoSeccio" ("cod_anoSecci"),
  FOREIGN KEY ("codigo_estud") REFERENCES "Tb_estudiant" ("codigo_estud")
);`,

`CREATE TABLE IF NOT EXISTS "Tb_colaborac" (
  "cod_colabora" INTEGER PRIMARY KEY,
  "cod_inscripc" INTEGER,
  "fecha_dPagos" DATE,
  "monto_dPagoS" VARCHAR(8),
  FOREIGN KEY ("cod_inscripc") REFERENCES "Tb_inscripci" ("cod_inscripc")
);`
];

// Función para ejecutar las sentencias SQL en serie
function executeStatements(index = 0) {
  if (index >= statements.length) {
    // Insertar datos de prueba
    db.all(`SELECT * FROM Tb_nupersona`, (err, rows) => {
      if (err) {
      console.error("Error en select:", err.message);
      } else {
      console.log("Contenido de Tb_nupersona:", rows);
      }
      // Cerrar conexión después de completar todo
      db.close((err) => {
      if (err) console.error(err.message);
      console.log("Base de datos creada y cerrada correctamente");
      });
    });
    return;
  }

  db.run(statements[index], (err) => {
    if (err) {
      console.error("Error en statement:", err.message);
      console.error("SQL:", statements[index]);
    }
    executeStatements(index + 1);
  });
}

// Iniciar la ejecución de las sentencias
db.serialize(() => {
  executeStatements();
});