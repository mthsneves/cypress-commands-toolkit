/**
 * Geradores de Massa Dinâmica: CPF, CNPJ, Celular, E-mail sem duplicidade
 */
export const DataGenerator = {
  /**
   * Gera uma string alfanumérica única baseada em timestamp e hash
   */
  uniqueHash: (length = 6): string => {
    return Math.random().toString(36).substring(2, 2 + length);
  },

  /**
   * Gera um e-mail único válido para evitar falhas de cadastro duplicado
   */
  email: (prefix = "teste"): string => {
    return `${prefix}_${Date.now()}_${DataGenerator.uniqueHash(4)}@automacao.com`;
  },

  /**
   * Gera número de celular válido no padrão brasileiro
   */
  cellphone: (mask = false): string => {
    const ddd = "11";
    const num = `9${Math.floor(10000000 + Math.random() * 90000000)}`;
    return mask ? `(${ddd}) ${num.substring(0, 5)}-${num.substring(5)}` : `${ddd}${num}`;
  },

  /**
   * Gera CPF válido com cálculo real dos dígitos verificadores
   */
  cpf: (mask = false): string => {
    const rnd = (n: number) => Math.round(Math.random() * n);
    const mod = (dividendo: number, divisor: number) =>
      Math.round(dividendo - Math.floor(dividendo / divisor) * divisor);

    let n1 = rnd(9),
      n2 = rnd(9),
      n3 = rnd(9),
      n4 = rnd(9),
      n5 = rnd(9),
      n6 = rnd(9),
      n7 = rnd(9),
      n8 = rnd(9),
      n9 = rnd(9);

    // Evita CPFs com todos os dígitos iguais (ex: 111.111.111-11), que são rejeitados pela Receita Federal
    while (
      n1 === n2 &&
      n2 === n3 &&
      n3 === n4 &&
      n4 === n5 &&
      n5 === n6 &&
      n6 === n7 &&
      n7 === n8 &&
      n8 === n9
    ) {
      n9 = rnd(9);
    }

    let d1 =
      n9 * 2 +
      n8 * 3 +
      n7 * 4 +
      n6 * 5 +
      n5 * 6 +
      n4 * 7 +
      n3 * 8 +
      n2 * 9 +
      n1 * 10;
    d1 = 11 - mod(d1, 11);
    if (d1 >= 10) d1 = 0;

    let d2 =
      d1 * 2 +
      n9 * 3 +
      n8 * 4 +
      n7 * 5 +
      n6 * 6 +
      n5 * 7 +
      n4 * 8 +
      n3 * 9 +
      n2 * 10 +
      n1 * 11;
    d2 = 11 - mod(d2, 11);
    if (d2 >= 10) d2 = 0;

    return mask
      ? `${n1}${n2}${n3}.${n4}${n5}${n6}.${n7}${n8}${n9}-${d1}${d2}`
      : `${n1}${n2}${n3}${n4}${n5}${n6}${n7}${n8}${n9}${d1}${d2}`;
  },

  /**
   * Gera CNPJ válido com cálculo real dos dígitos verificadores
   */
  cnpj: (mask = false): string => {
    const rnd = (n: number) => Math.round(Math.random() * n);
    const mod = (dividendo: number, divisor: number) =>
      Math.round(dividendo - Math.floor(dividendo / divisor) * divisor);

    const n1 = rnd(9),
      n2 = rnd(9),
      n3 = rnd(9),
      n4 = rnd(9),
      n5 = rnd(9),
      n6 = rnd(9),
      n7 = rnd(9),
      n8 = rnd(9);
    const n9 = 0,
      n10 = 0,
      n11 = 0,
      n12 = 1; // 0001
    let d1 =
      n12 * 2 +
      n11 * 3 +
      n10 * 4 +
      n9 * 5 +
      n8 * 6 +
      n7 * 7 +
      n6 * 8 +
      n5 * 9 +
      n4 * 2 +
      n3 * 3 +
      n2 * 4 +
      n1 * 5;
    d1 = 11 - mod(d1, 11);
    if (d1 >= 10) d1 = 0;

    let d2 =
      d1 * 2 +
      n12 * 3 +
      n11 * 4 +
      n10 * 5 +
      n9 * 6 +
      n8 * 7 +
      n7 * 8 +
      n6 * 9 +
      n5 * 2 +
      n4 * 3 +
      n3 * 4 +
      n2 * 5 +
      n1 * 6;
    d2 = 11 - mod(d2, 11);
    if (d2 >= 10) d2 = 0;

    return mask
      ? `${n1}${n2}.${n3}${n4}${n5}.${n6}${n7}${n8}/${n9}${n10}${n11}${n12}-${d1}${d2}`
      : `${n1}${n2}${n3}${n4}${n5}${n6}${n7}${n8}${n9}${n10}${n11}${n12}${d1}${d2}`;
  },

  /**
   * Remove acentos, símbolos e espaços extras
   */
  normalizeText: (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  },
};
