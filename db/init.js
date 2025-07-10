const sqlite3 = require('sqlite3').verbose();

// Conectar/Crear base de datos
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) return console.error(err.message);
  console.log("Conexión exitosa a SQLite");
});

// Crear tablas con restricciones mejoradas
const statements = [
`CREATE TABLE IF NOT EXISTS "Tb_nupersona" (
  "codigo_perso" INTEGER PRIMARY KEY AUTOINCREMENT,
  "primer_nombr" VARCHAR(20) NOT NULL,
  "segundo_nomb" VARCHAR(20),
  "primer_apell" VARCHAR(20) NOT NULL,
  "segund_apell" VARCHAR(20),
  "cedula" VARCHAR(10) NOT NULL UNIQUE,
  "fech_nacimie" DATE,
  "nacionalidad" VARCHAR(1),
  "correo_perso" VARCHAR(30),
  "direcc_perso" TEXT,
  "status_perso" BOOLEAN DEFAULT 1,
  "prin_telefono" VARCHAR(12) NOT NULL,
  "sec_telefono" VARCHAR(12),
  "cas_telefono" VARCHAR(12),
  "estado_civil" VARCHAR(10),
  "ocupacion_p" VARCHAR(20),
  "docente" BOOLEAN DEFAULT 0
);`,

`CREATE TABLE IF NOT EXISTS "Tabla_nCargo" (
  "codigo_cargo" INTEGER PRIMARY KEY AUTOINCREMENT,
  "nombre_cargo" VARCHAR(10) NOT NULL UNIQUE
);`,

`CREATE TABLE IF NOT EXISTS "Tb_nuSeccion" (
  "codigo_secci" INTEGER PRIMARY KEY AUTOINCREMENT,
  "nombre_secci" VARCHAR(10) NOT NULL UNIQUE
);`,

`CREATE TABLE IF NOT EXISTS "Tb_am_so_fam" (
  "cod_amSocFam" INTEGER PRIMARY KEY AUTOINCREMENT,
  "pers_amSoFam" INTEGER,
  "numero_ninos" INTEGER NOT NULL DEFAULT 0,
  "nume_adultos" INTEGER NOT NULL DEFAULT 0,
  "tip_caracter" VARCHAR(15) NOT NULL,
  "tip_tenencia" VARCHAR(15) NOT NULL
);`,

`CREATE TABLE IF NOT EXISTS "Tb_ante_pren" (
  "cod_antePren" INTEGER PRIMARY KEY AUTOINCREMENT,
  "enfe_madreEm" VARCHAR(35),
  "cod_codiPart" VARCHAR(50) NOT NULL,
  "edad_maParto" INTEGER NOT NULL,
  "peso_ninoNac" INTEGER NOT NULL,
  "tall_ninoNac" INTEGER NOT NULL,
  "medi_contPre" VARCHAR(30)
);`,

`CREATE TABLE IF NOT EXISTS "Tb_probl_nac" (
  "cod_probNace" INTEGER PRIMARY KEY AUTOINCREMENT,
  "edad_caminar" INTEGER NOT NULL,
  "edad_nhablar" INTEGER NOT NULL,
  "mano_dominan" VARCHAR(10) NOT NULL,
  "cod_enfePade" TEXT NOT NULL
);`,

`CREATE TABLE IF NOT EXISTS "Tb_represent" (
  "codigo_repre" INTEGER PRIMARY KEY AUTOINCREMENT,
  "parentesco_r" VARCHAR(20) NOT NULL,
  "codigo_perso" INTEGER NOT NULL UNIQUE,
  FOREIGN KEY ("codigo_perso") 
    REFERENCES "Tb_nupersona" ("codigo_perso")
    ON DELETE CASCADE
);`,

`CREATE TABLE IF NOT EXISTS "Tb_madreNino" (
  "codigo_madre" INTEGER PRIMARY KEY AUTOINCREMENT,
  "codigo_perso" INTEGER NOT NULL UNIQUE,
  FOREIGN KEY ("codigo_perso") 
    REFERENCES "Tb_nupersona" ("codigo_perso")
    ON DELETE CASCADE
);`,

`CREATE TABLE IF NOT EXISTS "Tb_padreNino" (
  "codigo_padre" INTEGER PRIMARY KEY AUTOINCREMENT,
  "codigo_perso" INTEGER NOT NULL UNIQUE,
  FOREIGN KEY ("codigo_perso") 
    REFERENCES "Tb_nupersona" ("codigo_perso")
    ON DELETE CASCADE
);`,

`CREATE TABLE IF NOT EXISTS "Tb_cont_emer" (
  "cod_contEmer" INTEGER PRIMARY KEY AUTOINCREMENT,
  "parentesco_e" VARCHAR(20) NOT NULL,
  "codigo_perso" INTEGER NOT NULL UNIQUE,
  FOREIGN KEY ("codigo_perso") 
    REFERENCES "Tb_nupersona" ("codigo_perso")
    ON DELETE CASCADE
);`,

`CREATE TABLE IF NOT EXISTS "Tb_anoSeccio" (
  "cod_anoSecci" INTEGER PRIMARY KEY AUTOINCREMENT,
  "ano_Seccione" INTEGER NOT NULL,
  "codigo_secci" INTEGER NOT NULL,
  "docente_prin" INTEGER NOT NULL,
  "docente_secu" INTEGER,
  FOREIGN KEY ("codigo_secci") 
    REFERENCES "Tb_nuSeccion" ("codigo_secci")
    ON DELETE CASCADE,
  FOREIGN KEY ("docente_prin") 
    REFERENCES "Tb_nupersona" ("codigo_perso")
    ON DELETE CASCADE,
  FOREIGN KEY ("docente_secu") 
    REFERENCES "Tb_nupersona" ("codigo_perso")
    ON DELETE SET NULL,
  UNIQUE ("ano_Seccione", "codigo_secci")
);`,

`CREATE TABLE IF NOT EXISTS "Tb_estudiant" (
  "codigo_estud" INTEGER PRIMARY KEY AUTOINCREMENT,
  "primer_nombr" VARCHAR(20) NOT NULL,
  "segundo_nomb" VARCHAR(20),
  "primer_apell" VARCHAR(20) NOT NULL,
  "segundo_apellido" VARCHAR(20),
  "fecha_nacimiento" DATE NOT NULL,
  "sexo" CHAR(1) NOT NULL CHECK(sexo IN ('M', 'F')),
  "nacionalidad" CHAR(1) NOT NULL,
  "tip_sangrees" BOOLEAN NOT NULL,
  "grupo_sangui" CHAR(2) NOT NULL,
  "estad_nacimi" VARCHAR(20) NOT NULL,
  "munic_nacimi" TEXT NOT NULL,
  "cedu_escolar" VARCHAR(14) NOT NULL UNIQUE,
  "status_estud" BOOLEAN DEFAULT 1,
  "peso_kg" INTEGER NOT NULL,
  "tall_cm" INTEGER NOT NULL,
  "fecha_inscripcion" DATE DEFAULT CURRENT_DATE,
  "codigo_repre" INTEGER NOT NULL,
  "codigo_padre" INTEGER NOT NULL,
  "codigo_madre" INTEGER NOT NULL,
  "cod_contEmer" INTEGER NOT NULL,
  "cod_amSocFam" INTEGER NOT NULL,
  "cod_antePren" INTEGER NOT NULL,
  "cod_probNace" INTEGER NOT NULL,
  FOREIGN KEY ("cod_amSocFam") 
    REFERENCES "Tb_am_so_fam" ("cod_amSocFam")
    ON DELETE CASCADE,
  FOREIGN KEY ("codigo_repre") 
    REFERENCES "Tb_represent" ("codigo_repre")
    ON DELETE CASCADE,
  FOREIGN KEY ("codigo_madre") 
    REFERENCES "Tb_madreNino" ("codigo_madre")
    ON DELETE CASCADE,
  FOREIGN KEY ("codigo_padre") 
    REFERENCES "Tb_padreNino" ("codigo_padre")
    ON DELETE CASCADE,
  FOREIGN KEY ("cod_contEmer") 
    REFERENCES "Tb_cont_emer" ("cod_contEmer")
    ON DELETE CASCADE,
  FOREIGN KEY ("cod_probNace") 
    REFERENCES "Tb_probl_nac" ("cod_probNace")
    ON DELETE CASCADE,
  FOREIGN KEY ("cod_antePren") 
    REFERENCES "Tb_ante_pren" ("cod_antePren")
    ON DELETE CASCADE
);`,

`CREATE TABLE IF NOT EXISTS "Tb_doceSecci" (
  "cod_doceSecc" INTEGER PRIMARY KEY AUTOINCREMENT,
  "cod_anoSecci" INTEGER NOT NULL,
  "codigo_perso" INTEGER NOT NULL,
  FOREIGN KEY ("cod_anoSecci") 
    REFERENCES "Tb_anoSeccio" ("cod_anoSecci")
    ON DELETE CASCADE,
  FOREIGN KEY ("codigo_perso") 
    REFERENCES "Tb_nupersona" ("codigo_perso")
    ON DELETE CASCADE,
  UNIQUE ("cod_anoSecci", "codigo_perso")
);`,

`CREATE TABLE IF NOT EXISTS "Tb_inscripci" (
  "cod_inscripc" INTEGER PRIMARY KEY AUTOINCREMENT,
  "cod_anoSecci" INTEGER NOT NULL,
  "codigo_estud" INTEGER NOT NULL,
  "entra_tardia" DATE,
  "salida_tempr" DATE,
  FOREIGN KEY ("cod_anoSecci") 
    REFERENCES "Tb_anoSeccio" ("cod_anoSecci")
    ON DELETE CASCADE,
  FOREIGN KEY ("codigo_estud") 
    REFERENCES "Tb_estudiant" ("codigo_estud")
    ON DELETE CASCADE,
  UNIQUE ("cod_anoSecci", "codigo_estud")
);`,

`CREATE TABLE IF NOT EXISTS "Tb_colaborac" (
  "cod_colabora" INTEGER PRIMARY KEY AUTOINCREMENT,
  "cod_inscripc" INTEGER NOT NULL,
  "fecha_dPagos" DATE DEFAULT CURRENT_DATE,
  "monto_dPagoS" DECIMAL(10,2) NOT NULL,
  FOREIGN KEY ("cod_inscripc") 
    REFERENCES "Tb_inscripci" ("cod_inscripc")
    ON DELETE CASCADE
);`,

// Índices para mejorar el rendimiento
`CREATE INDEX IF NOT EXISTS idx_persona_cedula ON Tb_nupersona(cedula);`,
`CREATE INDEX IF NOT EXISTS idx_estudiante_cedu_escolar ON Tb_estudiant(cedu_escolar);`,
`CREATE INDEX IF NOT EXISTS idx_anoSeccion_ano ON Tb_anoSeccio(ano_Seccione);`,
`CREATE INDEX IF NOT EXISTS idx_inscripcion_estudiante ON Tb_inscripci(codigo_estud);`,
`CREATE INDEX IF NOT EXISTS idx_colaboracion_inscripcion ON Tb_colaborac(cod_inscripc);`
];

// Ejecutar todas las sentencias en serie con manejo de errores
const executeStatements = async () => {
  for (const [index, sql] of statements.entries()) {
    try {
      await new Promise((resolve, reject) => {
        db.run(sql, (err) => {
          if (err) {
            console.error(`Error en statement ${index + 1}: ${err.message}`);
            console.error(`SQL: ${sql}`);
            reject(err);
          } else {
            console.log(`Sentencia ${index + 1} ejecutada correctamente`);
            resolve();
          }
        });
      });
    } catch (error) {
      console.error(`Error grave al ejecutar sentencia ${index + 1}, deteniendo ejecución`);
      db.close();
      return;
    }
  }
  
  // Verificar contenido de Tb_nupersona
  db.all(`SELECT * FROM Tb_nupersona LIMIT 1`, (err, rows) => {
    if (err) {
      console.error("Error en verificación:", err.message);
    } else {
      console.log("Verificación inicial completada");
    }
    
    // Cerrar conexión
    db.close((err) => {
      if (err) console.error(err.message);
      console.log("Base de datos creada y cerrada correctamente");
    });
  });
};

// Iniciar la ejecución de las sentencias
db.serialize(() => {
  executeStatements();
});