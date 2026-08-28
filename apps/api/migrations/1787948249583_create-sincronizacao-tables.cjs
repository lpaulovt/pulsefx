/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("indicador", {
    id: { type: "text", primaryKey: true },
    nome: { type: "text", notNull: true },
    tipo_serie: {
      type: "text",
      notNull: true,
      check: "tipo_serie IN ('fx-diaria', 'macro-mensal')",
    },
    fonte: {
      type: "text",
      notNull: true,
      check: "fonte IN ('bcb', 'fred')",
    },
    unidade: {
      type: "text",
      notNull: true,
      check: "unidade IN ('percentual', 'pontos-percentuais')",
    },
  });

  pgm.createTable("observacao", {
    id: "id",
    indicador_id: {
      type: "text",
      notNull: true,
      references: "indicador",
      onDelete: "CASCADE",
    },
    data_referencia: { type: "date", notNull: true },
    valor: { type: "numeric", notNull: true },
    criado_em: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.addConstraint("observacao", "observacao_indicador_data_unique", {
    unique: ["indicador_id", "data_referencia"],
  });

  pgm.createTable("job_execucao", {
    id: "id",
    indicador_id: {
      type: "text",
      notNull: true,
      references: "indicador",
      onDelete: "CASCADE",
    },
    executado_em: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    origem: {
      type: "text",
      notNull: true,
      check: "origem IN ('agendado', 'admin')",
    },
    status: {
      type: "text",
      notNull: true,
      check: "status IN ('sucesso', 'falha_fonte_externa')",
    },
    detalhe: { type: "text", notNull: false },
  });

  // Conjunto fechado do MVP (docs/product/pdr-selecao-indicadores.md) - seed via migration,
  // nao CRUD de usuario (specs/001-dashboard/data-model.md).
  pgm.sql(`
    INSERT INTO indicador (id, nome, tipo_serie, fonte, unidade) VALUES
      ('usd-brl-ptax', 'USD/BRL (PTAX venda)', 'fx-diaria', 'bcb', 'percentual'),
      ('meta-selic', 'Meta Selic', 'macro-mensal', 'bcb', 'pontos-percentuais'),
      ('ipca', 'IPCA (variacao mensal)', 'macro-mensal', 'bcb', 'percentual'),
      ('fed-funds', 'Federal Funds Effective Rate', 'macro-mensal', 'fred', 'percentual');
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("job_execucao");
  pgm.dropTable("observacao");
  pgm.dropTable("indicador");
};
