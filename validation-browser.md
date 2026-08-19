# Validação do jogo no navegador

A versão local compilou e abriu o canvas Babylon.js. A cena de Zao está sendo renderizada atrás da camada de carregamento, com a praça central, edifícios, rio vertical, ponte e caminhos visíveis.

O HUD permanece em "Preparando o códice de Âmbar" porque o backend local não possui `DATABASE_URL`; o console informa "Banco de dados indisponível". Esse bloqueio afeta apenas a inicialização dos dados persistentes do HUD, não a criação nem o render do mapa no canvas. A validação visual deverá ocultar temporariamente essa camada para examinar a cena de forma limpa.

Durante a inspeção, o overlay de carregamento foi removido apenas no DOM do navegador para revelar o canvas e verificar a composição visual. Isso não altera o código do jogo.
