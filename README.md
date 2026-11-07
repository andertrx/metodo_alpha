# Método Alpha — Landing Page

Landing page de vendas da mentoria **Método Alpha** (carreiras policiais).
HTML, CSS e JavaScript puros, sem build. Para publicar, basta subir a pasta (Vercel, Netlify, Hostinger, cPanel etc.).

## Estrutura
```
index.html              Página
assets/css/style.css    Estilos
assets/js/main.js       Motion e interações (+ CONFIG no topo)
assets/img/             Imagens (logo.svg, hero, aprovados/...)
```

## Antes de publicar
1. **Link do checkout:** em `assets/js/main.js`, preencha `CONFIG.checkoutUrl`. Todos os botões passam a usar esse link, e os parâmetros UTM são repassados automaticamente.
2. **Imagens:** as imagens atuais foram recortadas de um print de baixa resolução e são **provisórias**. Substitua pelos arquivos originais **com o mesmo nome**:
   - `assets/img/hero-tatico.jpg`: foto principal (policiais táticos)
   - `assets/img/hero-bg.jpg`: fundo do topo (é desfocado, então qualquer foto escura serve)
   - `assets/img/concurseiro-frustrado.jpg`
   - `assets/img/policial-noite.jpg`: faixa de chamada
   - `assets/img/aula-plataforma.jpg`: print da área de membros
   - `assets/img/aprovados/aprovado-01.jpg` … `aprovado-12.jpg`: artes de aprovação (formato quadrado)
3. **Logo:** `assets/img/logo.svg` é uma versão vetorial provisória. Troque pela logo oficial.
4. **Preço:** procure por `R$ 230,00` e `8,27` no `index.html`.
5. **Rodapé:** adicione os links de Termos de uso e Política de privacidade.

## Motion
- Abertura com o emblema sendo desenhado e cortina se abrindo (exibida uma vez por sessão).
- Headline revelada linha a linha, foto com revelação por máscara, contadores animados.
- Revelação de elementos ao rolar, ciclo do método animado, faixa de carreiras em movimento.
- Respeita `prefers-reduced-motion` (acessibilidade).
