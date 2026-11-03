function shortenNum(num) {
  let result;

  if (num >= 1000000) {
    result = (Math.floor(num / 100000) / 10).toString() + "M";
    if (num > Math.floor(num / 100000) * 100) {
      result = "+" + result;
    }
    return result;
  }

  if (num >= 1000) {
    result = (Math.floor(num / 100) / 10).toString() + "K";
    if (num > Math.floor(num / 100) * 100) {
      result = "+" + result;
    }
    return result;
  }

  return num.toString();
}

function tempoRelativo(dataComentario) {
  const timestamp = typeof dataComentario === 'number'
    ? dataComentario
    : new Date(dataComentario).getTime();

  const segundos = Math.floor((Date.now() - timestamp) / 1000);

  if (segundos < 60) return 'agora';

  const unidades = [
    { singular: 'ano', plural: 'anos', segundos: 31536000 },
    { singular: 'mês', plural: 'meses', segundos: 2592000 },
    { singular: 'semana', plural: 'semanas', segundos: 604800 },
    { singular: 'dia', plural: 'dias', segundos: 86400 },
    { singular: 'hora', plural: 'horas', segundos: 3600 },
    { singular: 'minuto', plural: 'minutos', segundos: 60 },
  ];

  for (const unidade of unidades) {
    const valor = Math.floor(segundos / unidade.segundos);
    if (valor >= 1) {
      const nome = valor === 1 ? unidade.singular : unidade.plural;
      return `${valor} ${nome}`;
    }
  }
}