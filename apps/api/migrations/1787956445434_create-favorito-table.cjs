/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // user_id vem do userId do Clerk (data-model.md) - nao ha FK local para usuario,
  // Clerk e a fonte de verdade de identidade (specs/003-favoritos/plan.md).
  pgm.createTable("favorito", {
    id: "id",
    user_id: { type: "text", notNull: true },
    indicador_id: {
      type: "text",
      notNull: true,
      references: "indicador",
      onDelete: "CASCADE",
    },
    criado_em: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.addConstraint("favorito", "favorito_user_indicador_unique", {
    unique: ["user_id", "indicador_id"],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("favorito");
};
