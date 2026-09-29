# Descrições — filamentos Bambu Lab (29/09/2026)

Texto próprio, sem copiar concorrente. Imagens só oficiais Bambu (ou render Bambu no PLA Lite).
Estrutura lida pelo tema (sections/dc-pdp-story.liquid): intro → <h3>Especificações</h3><ul> →
<div class="dc-rich"> (último elemento). Placeholders: {COR} {FRASE_COR} {IMG_COR} {IMG_RFID} {IMG_EXTRA}.

---

## PLA Lite — template

Specs de revenda (sem ficha técnica oficial acessível): 1,75 mm ±0,03, 1 kg, RFID, AMS, ~210 °C.
Imagens: {IMG_COR} = foto da cor (render Bambu); {IMG_RFID} = oficial Bambu. Sem imagem extra: as fotos de uso oficiais têm crédito de designer terceiro (panda) ou selo GREENGUARD do PLA Basic.

**Descrição curta (Bling `descricaoCurta` / resumo)**
Filamento PLA Lite Bambu Lab {COR}, 1,75 mm, rolo de 1 kg com carretel reutilizável e chip RFID.
Impressão fácil e acabamento fosco, pronto para AMS e AMS Lite.

**Descrição completa (HTML)**
```html
<p>O <strong>PLA Lite da Bambu Lab</strong> é o filamento para imprimir no dia a dia sem dor de cabeça: derrete fácil, adere bem à mesa e entrega peças com <strong>acabamento fosco</strong> que disfarça as linhas de camada. {FRASE_COR}</p>
<p>Vem no <strong>carretel reutilizável com chip RFID</strong>: nas impressoras Bambu Lab com AMS, a máquina reconhece material e cor sozinha.</p>
<h3>Especificações</h3>
<ul>
  <li><strong>Material</strong> PLA (ácido polilático)</li>
  <li><strong>Diâmetro</strong> 1,75 mm (±0,03 mm)</li>
  <li><strong>Peso líquido</strong> 1 kg</li>
  <li><strong>Carretel</strong> Reutilizável, com chip RFID</li>
  <li><strong>Acabamento</strong> Fosco</li>
  <li><strong>Compatível</strong> AMS, AMS Lite e impressoras FDM 1,75 mm</li>
</ul>
<div class="dc-rich">
  <section class="dc-rich__feature">
    <figure><img src="{IMG_COR}" alt="Cor firme, impressão sem sustos" loading="lazy"></figure>
    <div>
      <p class="dc-rich__kicker">PLA Lite · {COR}</p>
      <h3>Cor firme, impressão sem sustos</h3>
      <p>O PLA Lite é feito para quem quer resultado bonito sem ajuste fino: imprime em temperaturas baixas, praticamente não empena e o acabamento fosco valoriza o formato da peça.</p>
      <ul>
      <li><strong>Fácil de imprimir</strong> — ótimo para quem está começando</li>
      <li><strong>Acabamento fosco</strong> que esconde as camadas</li>
      <li><strong>Carretel reutilizável</strong> — menos plástico descartado</li>
      <li><strong>Custo-benefício</strong> para protótipos e peças do dia a dia</li>
      </ul>
    </div>
  </section>
  <figure class="dc-rich__banner">
    <img src="{IMG_RFID}" alt="Chip RFID e reconhecimento automático no AMS" loading="lazy">
    <figcaption>Com o chip RFID, a impressora identifica material e cor e já carrega o perfil de impressão certo.</figcaption>
  </figure>
  <section class="dc-rich__params">
    <p class="dc-rich__kicker">Configuração</p>
    <h3>Parâmetros recomendados</h3>
    <table>
      <tr><th>Temperatura do bico</th><td>~210 °C</td></tr>
      <tr><th>Diâmetro</th><td>1,75 mm ±0,03</td></tr>
      <tr><th>Peso do rolo</th><td>1 kg</td></tr>
      <tr><th>Compatibilidade</th><td>AMS · AMS Lite · FDM 1,75 mm</td></tr>
    </table>
  </section>
  <section class="dc-rich__cards">
    <article><h4>Na caixa</h4><p>1 rolo de 1 kg de PLA Lite no carretel reutilizável com chip RFID.</p></article>
    <article><h4>Armazenamento</h4><p>Guarde fechado, com sílica, longe de umidade. PLA úmido perde acabamento.</p></article>
    <article><h4>Ideal para</h4><p>Protótipos, organizadores, peças decorativas, brinquedos e impressões multicor no AMS.</p></article>
  </section>
</div>
```

### FRASE_COR por produto

| PLA-LITE-BRANCO-BAMBU | O branco é a base mais versátil da coleção: aceita pintura, fica limpo em peças técnicas e combina com qualquer outra cor no AMS. |
| PLA-LITE-PRETO-BAMBU | O preto dá um visual sóbrio e profissional, esconde marcas de uso e é a escolha certa para suportes, cases e peças funcionais. |
| PLA-LITE-AZUL-BAMBU | O azul é vivo e saturado — ótimo para peças decorativas, brinquedos e para destacar partes em impressões multicor. |
| PLA-LITE-AMARELO-GIRASSOL-BAMBU | O amarelo girassol é quente e chamativo, perfeito para peças decorativas, sinalização e detalhes que precisam aparecer. |
| PLA-LITE-CINZA-BAMBU | O cinza tem cara de protótipo de engenharia: neutro, mostra bem os detalhes da peça e combina com tudo. |
| PLA-LITE-VERDE-BAMBU | O verde é vibrante e alegre, ótimo para vasos, miniaturas, brinquedos e projetos de decoração. |
| PLA-LITE-VERMELHO-BAMBU | O vermelho é intenso e marcante — ideal para peças de destaque, botões, detalhes e impressões multicor. |

---

## PLA Basic Laranja — PLA-BASIC-LARANJA-BAMBU

Specs: TDS oficial Bambu PLA Basic V3.0. Imagens: oficiais Bambu.

**Descrição curta**
Filamento PLA Basic Bambu Lab laranja (cód. 10300), 1,75 mm, rolo de 1 kg com carretel reutilizável
e chip RFID. Cor vibrante, impressão rápida e compatível com todo o sistema AMS.

**Descrição completa (HTML)**
```html
<p>O <strong>PLA Basic</strong> é o filamento de referência da Bambu Lab: fácil de imprimir, rápido e com cores vivas e consistentes de rolo para rolo. O <strong>laranja (cód. 10300)</strong> é intenso e cheio de energia — ótimo para peças decorativas, brinquedos, sinalização e detalhes que precisam chamar atenção.</p>
<p>Vem no <strong>carretel reutilizável com chip RFID</strong>: com o AMS, a impressora identifica material e cor automaticamente.</p>
<h3>Especificações</h3>
<ul>
  <li><strong>Material</strong> PLA (ácido polilático)</li>
  <li><strong>Diâmetro</strong> 1,75 mm</li>
  <li><strong>Peso líquido</strong> 1 kg</li>
  <li><strong>Carretel</strong> Reutilizável, com chip RFID</li>
  <li><strong>Densidade</strong> 1,24 g/cm³</li>
  <li><strong>Compatível</strong> Todas as versões do AMS e impressoras FDM 1,75 mm</li>
</ul>
<div class="dc-rich">
  <section class="dc-rich__feature">
    <figure><img src="{IMG_COR}" alt="Laranja que chama atenção" loading="lazy"></figure>
    <div>
      <p class="dc-rich__kicker">PLA Basic · Laranja 10300</p>
      <h3>Laranja que chama atenção</h3>
      <p>Cor saturada e uniforme, com superfície lisa e brilho suave. O PLA Basic imprime rápido — até 300 mm/s — mantendo boa definição de detalhes.</p>
      <ul>
      <li><strong>Cores consistentes</strong> de rolo para rolo</li>
      <li><strong>Alta velocidade</strong> — até 300 mm/s</li>
      <li><strong>Carretel reutilizável</strong> com chip RFID</li>
      <li><strong>Baixo empenamento</strong>, adere bem à mesa</li>
      </ul>
    </div>
  </section>
  <figure class="dc-rich__banner">
    <img src="{IMG_RFID}" alt="Chip RFID e reconhecimento automático no AMS" loading="lazy">
    <figcaption>Chip RFID: a impressora reconhece o PLA Basic laranja no AMS e ajusta o perfil sozinha.</figcaption>
  </figure>
  <section class="dc-rich__feature dc-rich__feature--rev">
    <figure><img src="{IMG_EXTRA}" alt="Impressão 3D em casa com PLA Basic" loading="lazy"></figure>
    <div>
      <p class="dc-rich__kicker">Na prática</p>
      <h3>Feito para imprimir em casa</h3>
      <p>Sem cheiro forte e sem exigir câmara fechada: o PLA Basic é o material certo para imprimir em casa, no escritório ou na sala de aula.</p>
    </div>
  </section>
  <section class="dc-rich__params">
    <p class="dc-rich__kicker">Configuração</p>
    <h3>Parâmetros recomendados</h3>
    <table>
      <tr><th>Temperatura do bico</th><td>190–230 °C</td></tr>
      <tr><th>Temperatura da mesa</th><td>35–45 °C</td></tr>
      <tr><th>Velocidade</th><td>até 300 mm/s</td></tr>
      <tr><th>Secagem</th><td>50 °C por 8 h</td></tr>
      <tr><th>Densidade</th><td>1,24 g/cm³</td></tr>
    </table>
  </section>
  <section class="dc-rich__cards">
    <article><h4>Na caixa</h4><p>1 rolo de 1 kg de PLA Basic laranja no carretel reutilizável com chip RFID.</p></article>
    <article><h4>Armazenamento</h4><p>Local seco, idealmente abaixo de 20% de umidade, com sílica.</p></article>
    <article><h4>Ideal para</h4><p>Peças decorativas, brinquedos, sinalização, cosplay e impressões multicor.</p></article>
  </section>
</div>
```

---

## PETG Basic — template

Specs: TDS oficial Bambu PETG Basic V3.0 (`_shared-petg-basic/Bambu_PETG_Basic_TDS_V3.0.pdf`). Imagens: oficiais Bambu.

**Descrição curta (Bling `descricaoCurta` / resumo)**
Filamento PETG Basic Bambu Lab {COR}, 1,75 mm, rolo de 1 kg com carretel reutilizável e chip RFID.
Mais resistente e flexível que o PLA, aguenta calor e umidade. Compatível com todo o sistema AMS.

**Descrição completa (HTML)**
```html
<p>O <strong>PETG Basic da Bambu Lab</strong> é o filamento para peças que precisam durar: <strong>mais resistente a impacto e mais flexível que o PLA</strong>, aguenta até ~70 °C e não se incomoda com umidade — ideal para peças funcionais, suportes, caixas e uso externo. {FRASE_COR}</p>
<p>Vem no <strong>carretel reutilizável com chip RFID</strong>: com o AMS, a impressora identifica material e cor automaticamente.</p>
<h3>Especificações</h3>
<ul>
  <li><strong>Material</strong> PETG (polietileno tereftalato glicol)</li>
  <li><strong>Diâmetro</strong> 1,75 mm</li>
  <li><strong>Peso líquido</strong> 1 kg</li>
  <li><strong>Carretel</strong> Reutilizável, com chip RFID</li>
  <li><strong>Densidade</strong> 1,25 g/cm³</li>
  <li><strong>Resistência térmica</strong> HDT 71 °C</li>
  <li><strong>Compatível</strong> Todas as impressoras Bambu Lab e todo o sistema AMS</li>
</ul>
<div class="dc-rich">
  <section class="dc-rich__feature">
    <figure><img src="{IMG_COR}" alt="Resistência para peças de verdade" loading="lazy"></figure>
    <div>
      <p class="dc-rich__kicker">PETG Basic · {COR}</p>
      <h3>Resistência para peças de verdade</h3>
      <p>O PETG junta a facilidade do PLA com a robustez de um plástico de engenharia: flexiona antes de quebrar, resiste a calor moderado, a umidade e a produtos químicos leves.</p>
      <ul>
      <li><strong>Mais tenaz que o PLA</strong> — aguenta impacto e flexão</li>
      <li><strong>Resistente a calor</strong> — HDT de 71 °C</li>
      <li><strong>Resistente a umidade</strong> — bom para uso externo e cozinha</li>
      <li><strong>Carretel reutilizável</strong> com chip RFID</li>
      </ul>
    </div>
  </section>
  <figure class="dc-rich__banner">
    <img src="{IMG_RFID}" alt="Chip RFID e reconhecimento automático no AMS" loading="lazy">
    <figcaption>Chip RFID: no AMS, a impressora reconhece o PETG Basic e aplica o perfil de impressão certo.</figcaption>
  </figure>
  <section class="dc-rich__feature dc-rich__feature--rev">
    <figure><img src="{IMG_EXTRA}" alt="Peças funcionais impressas em PETG" loading="lazy"></figure>
    <div>
      <p class="dc-rich__kicker">Na prática</p>
      <h3>Peças que aguentam o uso</h3>
      <p>Caixas, encaixes, suportes e peças mecânicas: o PETG segura carga, calor e umidade onde o PLA começaria a deformar.</p>
    </div>
  </section>
  <section class="dc-rich__params">
    <p class="dc-rich__kicker">Configuração</p>
    <h3>Parâmetros recomendados</h3>
    <table>
      <tr><th>Temperatura do bico</th><td>230–260 °C</td></tr>
      <tr><th>Temperatura da mesa</th><td>65–75 °C</td></tr>
      <tr><th>Velocidade</th><td>até 200 mm/s</td></tr>
      <tr><th>Ventoinha</th><td>0–60%</td></tr>
      <tr><th>Secagem</th><td>65 °C por 8 h</td></tr>
    </table>
  </section>
  <section class="dc-rich__cards">
    <article><h4>Na caixa</h4><p>1 rolo de 1 kg de PETG Basic no carretel reutilizável com chip RFID.</p></article>
    <article><h4>Armazenamento</h4><p>Guarde fechado com sílica. Se ficou exposto, seque antes de imprimir.</p></article>
    <article><h4>Ideal para</h4><p>Peças funcionais, suportes, caixas, dobradiças e peças para uso externo.</p></article>
  </section>
</div>
```

### FRASE_COR por produto

| PETG-BASIC-BRANCO-BAMBU | O branco é a base mais versátil: limpo em peças técnicas, aceita pintura e combina com qualquer cor no AMS. |
| PETG-BASIC-CINZA-BAMBU | O cinza tem visual de peça de engenharia — neutro, discreto e ótimo para mostrar os detalhes da impressão. |
| PETG-BASIC-MARROM-BAMBU | O marrom escuro (Dark Brown) dá um acabamento sóbrio, ótimo para peças de decoração, móveis e acessórios com cara de madeira. |
| PETG-BASIC-AZUL-BAMBU | O azul (Reflex Blue) é intenso e elegante, ótimo para peças funcionais que também precisam ficar bonitas. |
| PETG-BASIC-VERMELHO-BAMBU | O vermelho é vivo e marcante — ideal para peças de destaque, sinalização e impressões multicor. |
| PETG-BASIC-AMARELO-BAMBU | O amarelo é chamativo e alegre, perfeito para sinalização, peças de segurança e detalhes que precisam aparecer. |
| PETG-BASIC-PRETO-BAMBU | O preto é a escolha clássica para peças funcionais: esconde marcas de uso e tem visual profissional. |
