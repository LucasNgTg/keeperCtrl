# Mecanismo fetch e utilização de JSON

**DATA:** 10/10/2026

A Fetch API é um recurso nativo do JavaScript utilizado para realizar requisições HTTP e obter recursos disponibilizados por servidores. Seu funcionamento é assíncrono, permitindo que a aplicação continue executando outras operações enquanto aguarda uma resposta.

O método fetch() retorna uma Promise, que representa o resultado futuro da requisição. Quando a resposta é recebida, pode-se utilizar o método json() para interpretar o conteúdo retornado no formato JSON (JavaScript Object Notation).

JSON é um formato textual utilizado para representar e transmitir dados estruturados, organizados em pares de chave e valor, arrays e objetos. Por sua simplicidade e compatibilidade com diversas linguagens, é amplamente utilizado na comunicação entre aplicações e servidores.

Podem ser utilizados para carregar informações dos jogos a partir de arquivos JSON, evitando a necessidade de inserir manualmente os dados diretamente no código das páginas. Também possibilitariam, em uma futura evolução, a obtenção de informações por meio de APIs externas.

## Exemplo de Utilização

```javascript
async function carregarJogos() {
  const resposta = await fetch("games.json");

  if (!resposta.ok) {
    throw new Error("Erro ao carregar os jogos.");
  }

  const jogos = await resposta.json();

  return jogos;
}
```

### Referências

[JavaScript Fetch API](https://www.w3schools.com/js/js_api_fetch.asp)
[JavaScript JSON](https://www.w3schools.com/js/js_json.asp)
[Usando Fetch - APIs da Web | MDN](https://developer.mozilla.org/pt-BR/docs/Web/API/Fetch_API/Using_Fetch)
[Trabalhando com JSON - Aprendendo desenvolvimento web | MDN](https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Scripting/JSON)
