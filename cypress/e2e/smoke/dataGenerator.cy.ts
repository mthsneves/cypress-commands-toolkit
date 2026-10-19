import { DataGenerator } from "../../support/utils/dataGenerator";

// Funções validadoras independentes para garantir a integridade dos algoritmos gerados
function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false; // descarta sequências de números iguais

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

function isValidCNPJ(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, "");
  if (clean.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(clean)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean.charAt(i), 10) * weights1[i];
  }
  let rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== parseInt(clean.charAt(12), 10)) return false;

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(clean.charAt(i), 10) * weights2[i];
  }
  rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== parseInt(clean.charAt(13), 10)) return false;

  return true;
}

describe("Smoke Tests: DataGenerator", () => {
  it("Valida geração de CPF válido com e sem máscara", () => {
    // 50 amostras sem máscara
    for (let i = 0; i < 50; i++) {
      const cpfSemMascara = DataGenerator.cpf(false);
      expect(cpfSemMascara).to.match(/^\d{11}$/);
      expect(isValidCPF(cpfSemMascara), `CPF ${cpfSemMascara} deve ser válido`).to.be.true;
    }

    // 50 amostras com máscara
    for (let i = 0; i < 50; i++) {
      const cpfComMascara = DataGenerator.cpf(true);
      expect(cpfComMascara).to.match(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
      expect(isValidCPF(cpfComMascara), `CPF ${cpfComMascara} deve ser válido`).to.be.true;
    }
  });

  it("Valida geração de CNPJ válido com e sem máscara", () => {
    // 50 amostras sem máscara
    for (let i = 0; i < 50; i++) {
      const cnpjSemMascara = DataGenerator.cnpj(false);
      expect(cnpjSemMascara).to.match(/^\d{14}$/);
      expect(isValidCNPJ(cnpjSemMascara), `CNPJ ${cnpjSemMascara} deve ser válido`).to.be.true;
    }

    // 50 amostras com máscara
    for (let i = 0; i < 50; i++) {
      const cnpjComMascara = DataGenerator.cnpj(true);
      expect(cnpjComMascara).to.match(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
      expect(isValidCNPJ(cnpjComMascara), `CNPJ ${cnpjComMascara} deve ser válido`).to.be.true;
    }
  });

  it("Valida unicidade de e-mails em 100 gerações consecutivas", () => {
    const emails = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const email = DataGenerator.email("usuario_teste");
      expect(email).to.match(/^usuario_teste_\d+_[a-z0-9]+@automacao\.com$/);
      expect(emails.has(email), `Email ${email} não deve ser duplicado`).to.be.false;
      emails.add(email);
    }
    expect(emails.size).to.equal(100);
  });

  it("Valida formato de número de celular com e sem máscara", () => {
    const phoneSemMascara = DataGenerator.cellphone(false);
    expect(phoneSemMascara).to.match(/^119\d{8}$/);

    const phoneComMascara = DataGenerator.cellphone(true);
    expect(phoneComMascara).to.match(/^\(11\) 9\d{4}-\d{4}$/);
  });

  it("Valida normalização de strings com acentos e espaços extras", () => {
    const resultado = DataGenerator.normalizeText("  Ação   Éxito ");
    expect(resultado).to.equal("acao exito");
  });
});
