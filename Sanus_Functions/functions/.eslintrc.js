module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [],
  rules: {
    // 🧠 Bugs reais
    "no-unused-vars": "error",
    "no-undef": "error",
    "no-unreachable": "error",
    "no-return-await": "error",
    "no-async-promise-executor": "error",
    "eqeqeq": ["error", "always"],
    "no-shadow": "error",
    "no-duplicate-imports": "error",

    // 🧹 Qualidade razoável
    "no-console": "off", // backend precisa de logs
    "consistent-return": "off",

    // ❌ Desligar regras de formatação
    "max-len": "off",
    "quotes": "off",
    "indent": "off",
    "comma-dangle": "off",
    "object-curly-spacing": "off",
    "arrow-parens": "off",
    "operator-linebreak": "off",
  },
};
