# Operadores adicionais do JavaScript
**DATA:** 14/10/2026

## Optional chaining (.?)

Permite acessar propriedades de objetos sem provocar erros quando uma referência intermediária possui valor null ou undefined. Caso uma dessas referências não exista, a expressão retorna undefined em vez de interromper a execução com um erro.

Pode ser utilizado para acessar informações opcionais dos jogos, como descrições, categorias ou avaliações, evitando verificações repetitivas.

### Referências

[JavaScript Operators Reference](https://www.w3schools.com/js/js_operators_reference.asp)
[Encadeamento opcional - JavaScript | MDN](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Operators/Optional_chaining)

## Nullish Coalescing (??)

Permite definir um valor padrão quando uma expressão resulta em null ou undefined. Diferentemente do operador lógico ||, não substitui valores válidos como 0 ou uma string vazia.

Pode ser utilizado para estabelecer valores padrão para informações não preenchidas, como descrições ou pontuações.

### Referências

[Nullish coalescing operator (??) - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)

## Spread syntax (...)

Permite expandir elementos de arrays ou propriedades de objetos em outros arrays, objetos ou chamadas de funções. É útil para combinar estruturas de dados, criar cópias superficiais e adicionar elementos sem modificar diretamente a estrutura original.

Pode facilitar operações de manipulação dos dados dos jogos, como combinar listas ou criar versões atualizadas de objetos.

### Referências

[Sintaxe de Espalhamento - JavaScript | MDN](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
