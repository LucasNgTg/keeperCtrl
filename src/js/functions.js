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

function relativeTime(commentDate) {
  const timestamp = Number(commentDate);

  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'agora';

  const units = [
    { singular: 'ano', plural: 'anos', seconds: 31536000 },
    { singular: 'mês', plural: 'meses', seconds: 2592000 },
    { singular: 'semana', plural: 'semanas', seconds: 604800 },
    { singular: 'dia', plural: 'dias', seconds: 86400 },
    { singular: 'hora', plural: 'horas', seconds: 3600 },
    { singular: 'minuto', plural: 'minutos', seconds: 60 },
  ];

  for (const unit of units) {
    const value = Math.floor(seconds / unit.seconds);
    if (value >= 1) {
      const name = value === 1 ? unit.singular : unit.plural;
      return `${value} ${name}`;
    }
  }
}

// Cria svg
function createIcon(name) {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 640 640");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");

  const iconUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
  iconUse.setAttribute("href", `assets/icons.svg#${name}`);
  icon.appendChild(iconUse);

  return icon;
}

