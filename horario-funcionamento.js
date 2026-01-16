import fetch from 'node-fetch';

const pad = (n) => String(n).padStart(2, '0');

const obterDataHoraReferencia = () => {
  const arg = process.argv[2];
  const data = arg ? new Date(arg) : new Date();

  if (arg && Number.isNaN(data.getTime())) {
    console.error('Formato inválido. Use: 2025-12-30T10:15:00');
    process.exit(1);
  }

  return data;
};

const ehFinalDeSemana = (data) => [0, 6].includes(data.getDay());

const estaNoHorario = (data) => {
  const dia = data.getDay();
  const min = data.getHours() * 60 + data.getMinutes();

  const horarios = {
    semana: [8 * 60, 20 * 60],
    sexta: [8 * 60, 19 * 60],
  };

  if (dia >= 1 && dia <= 4) return min >= horarios.semana[0] && min < horarios.semana[1];
  if (dia === 5) return min >= horarios.sexta[0] && min < horarios.sexta[1];
  return false;
};

const buscarFeriados = async (ano) => {
  try {
    const resp = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
    if (!resp.ok) throw new Error();
    const dados = await resp.json();
    return new Set(dados.map((f) => f.data));
  } catch {
    return null;
  }
};

const formatar = (data) =>
  `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())} ${pad(data.getHours())}:${pad(data.getMinutes())}`;

const chaveData = (data) =>
  `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`;

const main = async () => {
  const data = obterDataHoraReferencia();
  const feriados = await buscarFeriados(data.getFullYear());

  if (feriados?.has(chaveData(data))) {
    return console.log(`${formatar(data)} está fora do horário (feriado).`);
  }

  if (ehFinalDeSemana(data)) {
    return console.log(`${formatar(data)} está fora do horário (final de semana).`);
  }

  console.log(
    estaNoHorario(data)
      ? `${formatar(data)} está dentro do horário de funcionamento.`
      : `${formatar(data)} está fora do horário de funcionamento.`
  );
};

main();
