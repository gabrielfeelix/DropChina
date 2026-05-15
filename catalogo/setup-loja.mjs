import { spawnSync } from "node:child_process";

const STORE = "akfd19-1c.myshopify.com";
const PUBLICATION_ID = "gid://shopify/Publication/196225990875";

function exec(query, variables = {}) {
  const res = spawnSync(
    "shopify",
    [
      "store",
      "execute",
      `--store=${STORE}`,
      "--allow-mutations",
      "--query",
      query,
      "--variables",
      JSON.stringify(variables),
    ],
    { encoding: "utf8" }
  );
  if (res.status !== 0) {
    console.error("CLI error:", res.stderr);
    throw new Error("shopify CLI exited non-zero");
  }
  const stdout = res.stdout;
  const jsonStart = stdout.indexOf("{\n");
  const json = JSON.parse(stdout.slice(jsonStart));
  return json;
}

function placeholder(text) {
  const safe = encodeURIComponent(text.slice(0, 40));
  return `https://placehold.co/600x600/F5F5F7/0F4FA8.png?text=${safe}&font=montserrat`;
}

const COLLECTIONS = [
  {
    title: "Cartuchos de Tinta",
    handle: "cartuchos-de-tinta",
    tag: "categoria-cartuchos",
    descriptionHtml: "<p>Cartuchos de tinta originais e compatíveis HP, Canon, Epson e Brother com qualidade garantida e preço de Mercado Livre.</p>",
  },
  {
    title: "Toners",
    handle: "toners",
    tag: "categoria-toners",
    descriptionHtml: "<p>Toners compatíveis e originais para impressoras laser HP, Brother, Samsung e Xerox. Rendimento alto, impressão nítida.</p>",
  },
  {
    title: "Papéis e Suprimentos",
    handle: "papeis",
    tag: "categoria-papeis",
    descriptionHtml: "<p>Papel fotográfico, sulfite e especiais para impressão profissional ou doméstica.</p>",
  },
  {
    title: "Impressoras",
    handle: "impressoras",
    tag: "categoria-impressoras",
    descriptionHtml: "<p>Impressoras multifuncionais, jato de tinta e térmicas para casa, escritório e ponto de venda.</p>",
  },
  {
    title: "Periféricos e Acessórios",
    handle: "perifericos",
    tag: "categoria-perifericos",
    descriptionHtml: "<p>Cabos, adaptadores, leitores de cartão, placas de vídeo e acessórios para o dia a dia tech.</p>",
  },
  {
    title: "Monitores",
    handle: "monitores",
    tag: "categoria-monitores",
    descriptionHtml: "<p>Monitores LED para office, estudo e produtividade com excelente custo-benefício.</p>",
  },
  {
    title: "Mini PCs e Computadores",
    handle: "mini-pcs",
    tag: "categoria-mini-pcs",
    descriptionHtml: "<p>Mini PCs compactos e poderosos para escritório, home office e uso corporativo.</p>",
  },
];

const PRODUCTS = [
  {
    title: "Kit 5 Toners Compatíveis HP Laser MFP 135a 135w 137fnw - W1105A 105A com Chip",
    handle: "kit-5-toner-w1105a-105a-evolut",
    vendor: "Evolut",
    productType: "Toners",
    tags: ["categoria-toners", "marca-evolut", "compativel-hp", "kit"],
    price: "198.00",
    sku: "EVO-W1105A-KIT5",
    descriptionHtml: `<p>Kit econômico com <strong>5 toners compatíveis HP 105A</strong> com chip integrado. Ideal para escritório que imprime em volume e quer reduzir custo por página sem perder qualidade.</p>
<h3>Principais características</h3>
<ul><li>Kit com 5 unidades — economia imediata</li><li>Chip integrado — reconhecimento automático na impressora</li><li>Rendimento aproximado de 1.000 páginas por unidade (cobertura 5%)</li><li>Pó de toner premium — impressão nítida e uniforme</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Evolut</li><li><strong>Modelo:</strong> W1105A / 105A</li><li><strong>Cor:</strong> Preto</li><li><strong>Tipo:</strong> Compatível</li></ul>
<h3>Compatibilidade</h3>
<p>HP Laser MFP 135a, 135w, 137fnw, 107a, 107w e demais modelos da linha 105A.</p>`,
  },
  {
    title: "Kit Cartucho HP 667 Preto + 667 Tricolor Original",
    handle: "kit-cartucho-hp-667-preto-tricolor",
    vendor: "HP",
    productType: "Cartuchos",
    tags: ["categoria-cartuchos", "marca-hp", "original", "kit"],
    price: "185.00",
    sku: "HP-667-KIT-PT-COL",
    descriptionHtml: `<p>Kit econômico com <strong>cartucho HP 667 preto e tricolor originais</strong>. A escolha certa para quem quer impressão de qualidade comprovada da HP.</p>
<h3>Principais características</h3>
<ul><li>2 cartuchos originais HP — preto e tricolor</li><li>Tinta antiborrão e secagem rápida</li><li>Cores vibrantes e textos nítidos</li><li>Pronto para uso, sem instalação complicada</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> HP</li><li><strong>Modelo:</strong> 667 (preto + tricolor)</li><li><strong>Tipo:</strong> Original</li><li><strong>Conteúdo:</strong> 2 cartuchos</li></ul>
<h3>Compatibilidade</h3>
<p>HP DeskJet Ink Advantage 2374, 2375, 2376, 2774, 2775, 2776, 6475 e similares.</p>`,
  },
  {
    title: "Placa de Vídeo Clanm GeForce GT 730 4GB DDR3 128bit",
    handle: "placa-video-gt730-4gb-clanm",
    vendor: "Clanm",
    productType: "Periféricos",
    tags: ["categoria-perifericos", "marca-clanm", "placa-video", "gpu"],
    price: "305.00",
    sku: "CLANM-GT730-4GB",
    descriptionHtml: `<p>Placa de vídeo <strong>GeForce GT 730</strong> com 4GB DDR3 — entrada perfeita para PC de escritório, multimídia e jogos casuais.</p>
<h3>Principais características</h3>
<ul><li>4GB de memória DDR3</li><li>Barramento de 128 bits</li><li>Saídas HDMI, VGA e DVI</li><li>Refrigeração ativa silenciosa</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Clanm</li><li><strong>Modelo:</strong> GeForce GT 730</li><li><strong>Memória:</strong> 4GB DDR3</li><li><strong>Interface:</strong> PCIe x16</li></ul>`,
  },
  {
    title: "Toner Compatível HP W1105 105A com Chip - Tinta Preto Evolut",
    handle: "toner-w1105-105a-evolut",
    vendor: "Evolut",
    productType: "Toners",
    tags: ["categoria-toners", "marca-evolut", "compativel-hp"],
    price: "36.00",
    sku: "EVO-W1105A",
    descriptionHtml: `<p>Toner compatível <strong>HP 105A</strong> com chip integrado. Reconhecimento automático e impressão nítida do primeiro ao último uso.</p>
<h3>Principais características</h3>
<ul><li>Chip integrado — plug and play</li><li>Rendimento ~1.000 páginas (cobertura 5%)</li><li>Tinta preta intensa</li><li>Embalagem com proteção anti-vazamento</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Evolut</li><li><strong>Modelo:</strong> W1105A / 105A</li><li><strong>Cor:</strong> Preto</li><li><strong>Tipo:</strong> Compatível</li></ul>
<h3>Compatibilidade</h3>
<p>HP Laser MFP 135a, 135w, 137fnw, 107a, 107w.</p>`,
  },
  {
    title: "Cartucho Toner Compatível DCP-L5652DN MFC-L6702DW TN3472 Byqualy",
    handle: "toner-tn3472-byqualy",
    vendor: "Byqualy",
    productType: "Toners",
    tags: ["categoria-toners", "marca-byqualy", "compativel-brother"],
    price: "56.50",
    sku: "BYQ-TN3472",
    descriptionHtml: `<p>Toner compatível <strong>Brother TN3472</strong> com alto rendimento. Ideal para escritórios e operações de alta demanda.</p>
<h3>Principais características</h3>
<ul><li>Alto rendimento — até 12.000 páginas</li><li>Compatibilidade comprovada</li><li>Pó de toner uniforme</li><li>Garantia de impressão</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Byqualy</li><li><strong>Modelo:</strong> TN3472 / TN-3472</li><li><strong>Cor:</strong> Preto</li><li><strong>Tipo:</strong> Compatível</li></ul>
<h3>Compatibilidade</h3>
<p>Brother DCP-L5652DN, MFC-L6702DW, L5652, HL-L6202DW, MFC-L5902DW.</p>`,
  },
  {
    title: "Papel Fotográfico Glossy A4 230g 200 Folhas Masterprint",
    handle: "papel-fotografico-glossy-a4-230g-masterprint",
    vendor: "Masterprint",
    productType: "Papéis",
    tags: ["categoria-papeis", "marca-masterprint", "fotografico", "mais-vendido"],
    price: "58.40",
    sku: "MP-GLOSSY-A4-200",
    descriptionHtml: `<p>Pacote com <strong>200 folhas de papel fotográfico Glossy A4 230g</strong>. Brilho profissional, secagem rápida e qualidade fotográfica de loja.</p>
<h3>Principais características</h3>
<ul><li>Acabamento brilhante (glossy)</li><li>Gramatura premium 230g</li><li>200 folhas em um pacote</li><li>Compatível com impressoras jato de tinta</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Masterprint</li><li><strong>Formato:</strong> A4 (210 x 297 mm)</li><li><strong>Gramatura:</strong> 230 g/m²</li><li><strong>Acabamento:</strong> Glossy (brilho)</li><li><strong>Quantidade:</strong> 200 folhas</li></ul>`,
  },
  {
    title: "Kit Internet Via Satélite Starlink Mini Branco",
    handle: "kit-starlink-mini-branco",
    vendor: "Starlink",
    productType: "Periféricos",
    tags: ["categoria-perifericos", "marca-starlink", "internet", "destaque"],
    price: "980.00",
    sku: "STAR-MINI-WHT",
    descriptionHtml: `<p>O <strong>Starlink Mini</strong> traz internet via satélite de alta velocidade para qualquer lugar do Brasil — perfeito para áreas rurais, viagens e backup de conexão.</p>
<h3>Principais características</h3>
<ul><li>Antena compacta e portátil</li><li>Conexão de baixa latência</li><li>Velocidade alta para vídeo, jogos e trabalho</li><li>Setup em minutos</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Starlink</li><li><strong>Modelo:</strong> Mini Branco</li><li><strong>Cobertura:</strong> Brasil inteiro</li><li><strong>Wi-Fi integrado:</strong> Sim</li></ul>`,
  },
  {
    title: "Cartucho HP 667 Tricolor 3YM78AB Original",
    handle: "cartucho-hp-667-colorido",
    vendor: "HP",
    productType: "Cartuchos",
    tags: ["categoria-cartuchos", "marca-hp", "original"],
    price: "92.00",
    sku: "HP-667-COL",
    descriptionHtml: `<p>Cartucho <strong>HP 667 tricolor original</strong>. Cores vibrantes para fotos, gráficos e materiais coloridos.</p>
<h3>Principais características</h3>
<ul><li>Tinta HP original</li><li>Cores fiéis e duradouras</li><li>Pronto para uso</li><li>Compatível com impressoras HP DeskJet Ink Advantage</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> HP</li><li><strong>Código:</strong> 3YM78AB</li><li><strong>Cor:</strong> Tricolor</li><li><strong>Tipo:</strong> Original</li></ul>
<h3>Compatibilidade</h3>
<p>HP DeskJet Ink Advantage 2374, 2375, 2376, 2774, 2775, 2776, 6475.</p>`,
  },
  {
    title: "Leitor de Cartão 2 em 1 Ugreen 80191 USB-A + USB-C",
    handle: "leitor-cartao-ugreen-80191",
    vendor: "Ugreen",
    productType: "Periféricos",
    tags: ["categoria-perifericos", "marca-ugreen"],
    price: "57.90",
    sku: "UGR-80191",
    descriptionHtml: `<p>Leitor de cartão <strong>Ugreen 80191</strong> com saídas USB-A e USB-C — funciona em PC, Mac, smartphone e tablet.</p>
<h3>Principais características</h3>
<ul><li>Compatível com SD e MicroSD</li><li>Conectores USB-A e USB-C</li><li>Plug and play (sem driver)</li><li>Velocidade USB 3.0</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Ugreen</li><li><strong>Modelo:</strong> 80191</li><li><strong>Padrão:</strong> USB 3.0</li></ul>`,
  },
  {
    title: "Leitor de Cartão USB-C 3.0 Ugreen CM304 SD/TF Micro SD Preto",
    handle: "leitor-cartao-ugreen-cm304",
    vendor: "Ugreen",
    productType: "Periféricos",
    tags: ["categoria-perifericos", "marca-ugreen"],
    price: "56.16",
    sku: "UGR-CM304",
    descriptionHtml: `<p>Leitor de cartão <strong>Ugreen CM304 USB-C 3.0</strong> com slots para SD e Micro SD simultâneos. Perfeito para fotógrafos e criadores de conteúdo.</p>
<h3>Principais características</h3>
<ul><li>USB-C 3.0 — alta velocidade de transferência</li><li>Slots SD e Micro SD simultâneos</li><li>Design compacto preto</li><li>Compatível com Mac, Windows, Android e iPad</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Ugreen</li><li><strong>Modelo:</strong> CM304</li><li><strong>Conexão:</strong> USB-C 3.0</li><li><strong>Cor:</strong> Preto</li></ul>`,
  },
  {
    title: "Cartucho de Tinta HP 667 Kit Preto + Colorido",
    handle: "cartucho-hp-667-kit-preto-colorido-2",
    vendor: "HP",
    productType: "Cartuchos",
    tags: ["categoria-cartuchos", "marca-hp", "original", "kit"],
    price: "198.00",
    sku: "HP-667-KIT2",
    descriptionHtml: `<p>Kit cartucho <strong>HP 667 preto + tricolor original</strong> com aproveitamento máximo. Versão econômica para uso doméstico ou pequeno escritório.</p>
<h3>Principais características</h3>
<ul><li>Cartucho preto + tricolor</li><li>Tinta original HP</li><li>Cores vibrantes e textos nítidos</li><li>Compatível com a linha HP DeskJet Ink Advantage</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> HP</li><li><strong>Modelo:</strong> 667 (kit)</li><li><strong>Tipo:</strong> Original</li></ul>`,
  },
  {
    title: "Toner MLT-D111 Compatível Samsung Xpress M2020 M2020fw M2070w M2022w",
    handle: "toner-mlt-d111-samsung-xpress",
    vendor: "Premium",
    productType: "Toners",
    tags: ["categoria-toners", "marca-premium", "compativel-samsung"],
    price: "36.00",
    sku: "PREM-MLT-D111",
    descriptionHtml: `<p>Toner compatível <strong>Samsung MLT-D111</strong>. Excelente custo-benefício para impressoras Xpress da Samsung.</p>
<h3>Principais características</h3>
<ul><li>Compatibilidade comprovada</li><li>Rendimento ~1.000 páginas</li><li>Pó de toner uniforme</li><li>Pronto para instalação</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Premium</li><li><strong>Modelo:</strong> MLT-D111 / D111S</li><li><strong>Cor:</strong> Preto</li><li><strong>Tipo:</strong> Compatível</li></ul>
<h3>Compatibilidade</h3>
<p>Samsung Xpress M2020, M2020FW, M2070, M2070W, M2070FW, M2022, M2022W.</p>`,
  },
  {
    title: "Kit Cartucho HP 667 Preto + Tricolor 2376 e 2776 Original",
    handle: "kit-cartucho-hp-667-2376-2776",
    vendor: "HP",
    productType: "Cartuchos",
    tags: ["categoria-cartuchos", "marca-hp", "original", "kit"],
    price: "186.50",
    sku: "HP-667-2376-2776",
    descriptionHtml: `<p>Kit cartucho <strong>HP 667 original</strong>, otimizado para os modelos DeskJet Ink Advantage 2376 e 2776.</p>
<h3>Principais características</h3>
<ul><li>Cartucho preto + colorido</li><li>Tinta original HP</li><li>Compatibilidade direta com 2376 e 2776</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> HP</li><li><strong>Modelo:</strong> 667 kit</li><li><strong>Tipo:</strong> Original</li></ul>
<h3>Compatibilidade</h3>
<p>HP DeskJet Ink Advantage 2376 e 2776.</p>`,
  },
  {
    title: "Kit 3 Toners Compatíveis Brother TN1060 Evolut HL1212 DCP1510",
    handle: "kit-3-toner-tn1060-evolut",
    vendor: "Evolut",
    productType: "Toners",
    tags: ["categoria-toners", "marca-evolut", "compativel-brother", "kit"],
    price: "48.50",
    sku: "EVO-TN1060-KIT3",
    descriptionHtml: `<p>Kit econômico com <strong>3 toners compatíveis Brother TN1060</strong>. Garante meses de impressão sem precisar repor.</p>
<h3>Principais características</h3>
<ul><li>3 toners no mesmo pacote</li><li>Rendimento ~1.000 páginas cada</li><li>Compatibilidade testada</li><li>Pó de toner uniforme</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Evolut</li><li><strong>Modelo:</strong> TN1060 / TN-1060</li><li><strong>Cor:</strong> Preto</li><li><strong>Tipo:</strong> Compatível</li></ul>
<h3>Compatibilidade</h3>
<p>Brother HL-1212W, HL-1112, DCP-1510, DCP-1512, DCP-1602, DCP-1617NW, MFC-1810, MFC-1815.</p>`,
  },
  {
    title: "Escova Rotativa Marula Bivolt GA.MA Italy",
    handle: "escova-rotativa-marula-gama",
    vendor: "GA.MA Italy",
    productType: "Periféricos",
    tags: ["categoria-perifericos", "marca-gama", "beleza"],
    price: "361.90",
    sku: "GAMA-MARULA",
    descriptionHtml: `<p>Escova rotativa <strong>GA.MA Marula Bivolt</strong> — modela e seca os fios em uma só etapa. Para um cabelo com brilho de salão em casa.</p>
<h3>Principais características</h3>
<ul><li>Bivolt automático (110V/220V)</li><li>Cerdas mistas para modelar e brilhar</li><li>Tecnologia íon — reduz frizz</li><li>Aquecimento rápido</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> GA.MA Italy</li><li><strong>Modelo:</strong> Marula</li><li><strong>Voltagem:</strong> Bivolt</li></ul>`,
  },
  {
    title: "Impressora Multifuncional Cor Branco Epson WorkForce Pro WF-C5890",
    handle: "impressora-epson-wf-c5890",
    vendor: "Epson",
    productType: "Impressoras",
    tags: ["categoria-impressoras", "marca-epson", "multifuncional", "premium"],
    price: "3955.00",
    sku: "EPSON-WF-C5890",
    descriptionHtml: `<p>Impressora multifuncional jato de tinta <strong>Epson WorkForce Pro WF-C5890</strong>. Velocidade alta, qualidade laser e custo por página até 50% menor que laser convencional.</p>
<h3>Principais características</h3>
<ul><li>Imprime, copia, escaneia e envia fax</li><li>Até 25 ppm preto e colorido</li><li>Display touchscreen</li><li>Wi-Fi, Ethernet e impressão móvel</li><li>Tinta pigmentada DURABrite Pro — resistente à água</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Epson</li><li><strong>Modelo:</strong> WorkForce Pro WF-C5890</li><li><strong>Cor:</strong> Branco</li><li><strong>Tipo:</strong> Multifuncional jato de tinta</li></ul>`,
  },
  {
    title: "Impressora de Cupom e QR Code ISD 12 USB Ethernet Preto",
    handle: "impressora-cupom-isd-12",
    vendor: "DropChina",
    productType: "Impressoras",
    tags: ["categoria-impressoras", "marca-dropchina", "termica", "pos"],
    price: "296.00",
    sku: "DC-ISD-12",
    descriptionHtml: `<p>Impressora térmica <strong>ISD 12</strong> para cupons fiscais, comandas e QR Code Pix. Pequena, silenciosa e robusta para o ponto de venda.</p>
<h3>Principais características</h3>
<ul><li>Conexão USB e Ethernet</li><li>Velocidade de impressão até 250 mm/s</li><li>Suporta QR Code (Pix)</li><li>Compatível com sistemas de PDV e ERP</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Tipo:</strong> Térmica</li><li><strong>Largura do papel:</strong> 80mm</li><li><strong>Conectividade:</strong> USB + Ethernet</li><li><strong>Cor:</strong> Preto</li></ul>`,
  },
  {
    title: "Toner Evolut 105A Compatível W1105A 137fnw 107a 107w Preto",
    handle: "toner-evolut-105a-w1105a",
    vendor: "Evolut",
    productType: "Toners",
    tags: ["categoria-toners", "marca-evolut", "compativel-hp"],
    price: "36.50",
    sku: "EVO-105A-V2",
    descriptionHtml: `<p>Toner Evolut compatível <strong>HP 105A</strong> com chip integrado. Solução econômica para a linha HP Laser 100.</p>
<h3>Principais características</h3>
<ul><li>Chip integrado</li><li>Pó de toner premium</li><li>Rendimento ~1.000 páginas</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Evolut</li><li><strong>Modelo:</strong> 105A / W1105A</li><li><strong>Cor:</strong> Preto</li></ul>
<h3>Compatibilidade</h3>
<p>HP Laser 107a, 107w, 135a, 135w, 137fnw.</p>`,
  },
  {
    title: "Cabo Adaptador HDMI para VGA com Áudio - B Basto",
    handle: "cabo-hdmi-vga-b-basto",
    vendor: "B Basto",
    productType: "Periféricos",
    tags: ["categoria-perifericos", "marca-bbasto", "cabo"],
    price: "23.90",
    sku: "BBA-HDMI-VGA",
    descriptionHtml: `<p>Adaptador <strong>HDMI para VGA com áudio</strong>. Conecte notebooks e PCs modernos a monitores e projetores antigos com áudio P2.</p>
<h3>Principais características</h3>
<ul><li>Conversor HDMI macho para VGA fêmea</li><li>Saída de áudio P2 (3,5mm)</li><li>Suporta resolução até 1080p</li><li>Plug and play</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> B Basto</li><li><strong>Tipo:</strong> Adaptador HDMI → VGA + Áudio</li></ul>`,
  },
  {
    title: "PC Mini Pcyes One B300 Core i3 8GB RAM 256GB SSD",
    handle: "pc-mini-pcyes-b300-i3-8gb",
    vendor: "Pcyes",
    productType: "Mini PCs",
    tags: ["categoria-mini-pcs", "marca-pcyes", "destaque"],
    price: "1989.00",
    sku: "PCYES-B300-I3",
    descriptionHtml: `<p>Mini PC <strong>Pcyes One B300</strong> com Intel Core i3, 8GB RAM e SSD 256GB. Compacto, silencioso e poderoso para escritório, home office e produtividade.</p>
<h3>Principais características</h3>
<ul><li>Processador Intel Core i3</li><li>8GB de memória RAM</li><li>SSD 256GB — boot rápido</li><li>Saídas HDMI + DisplayPort</li><li>Wi-Fi e Bluetooth integrados</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Pcyes</li><li><strong>Modelo:</strong> One B300</li><li><strong>Processador:</strong> Intel Core i3</li><li><strong>Memória:</strong> 8GB</li><li><strong>Armazenamento:</strong> SSD 256GB</li></ul>`,
  },
  {
    title: "Placa de Vídeo Pcyes Nvidia GeForce RTX 3060 12GB GDDR6 192-bit Graffiti Edge",
    handle: "gpu-nvidia-rtx3060-12gb-pcyes",
    vendor: "Pcyes",
    productType: "Periféricos",
    tags: ["categoria-perifericos", "marca-pcyes", "placa-video", "gpu", "gamer"],
    price: "2515.00",
    sku: "PCYES-RTX3060-12GB",
    descriptionHtml: `<p>Placa de vídeo <strong>Pcyes Nvidia GeForce RTX 3060 12GB</strong> Graffiti Edge — performance gamer e criadora de conteúdo com Ray Tracing e DLSS.</p>
<h3>Principais características</h3>
<ul><li>12GB de memória GDDR6</li><li>Barramento de 192 bits</li><li>Ray Tracing e DLSS</li><li>Refrigeração com 2 fans silenciosos</li><li>Saídas HDMI e DisplayPort</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Pcyes</li><li><strong>Modelo:</strong> GeForce RTX 3060 12GB Graffiti Edge</li><li><strong>Memória:</strong> 12GB GDDR6</li><li><strong>Interface:</strong> PCIe 4.0 x16</li></ul>`,
  },
  {
    title: "Toner Evolut TN1060 Preto Compatível 370g",
    handle: "toner-evolut-tn1060",
    vendor: "Evolut",
    productType: "Toners",
    tags: ["categoria-toners", "marca-evolut", "compativel-brother"],
    price: "21.50",
    sku: "EVO-TN1060",
    descriptionHtml: `<p>Toner compatível <strong>Brother TN1060</strong> em embalagem refil de 370g — máximo aproveitamento, mínimo custo.</p>
<h3>Principais características</h3>
<ul><li>370g de pó de toner</li><li>Compatibilidade testada</li><li>Embalagem reforçada</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Evolut</li><li><strong>Modelo:</strong> TN1060</li><li><strong>Conteúdo:</strong> 370g</li></ul>
<h3>Compatibilidade</h3>
<p>Brother HL-1212W, DCP-1510, DCP-1602, MFC-1810 e similares.</p>`,
  },
  {
    title: "Monitor Skul 19,5\" Office LED HD 75Hz HDMI/VGA SM1955 Preto",
    handle: "monitor-skul-19-sm1955",
    vendor: "Skul",
    productType: "Monitores",
    tags: ["categoria-monitores", "marca-skul", "office"],
    price: "399.00",
    sku: "SKUL-SM1955",
    descriptionHtml: `<p>Monitor <strong>Skul SM1955</strong> de 19,5 polegadas com taxa de atualização de 75Hz. Perfeito para escritório, estudos e tarefas do dia a dia.</p>
<h3>Principais características</h3>
<ul><li>Tela LED HD de 19,5 polegadas</li><li>Taxa de atualização de 75Hz</li><li>Tempo de resposta 5ms</li><li>Conexões HDMI e VGA</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Skul</li><li><strong>Modelo:</strong> SM1955</li><li><strong>Tamanho:</strong> 19,5" (49,5 cm)</li><li><strong>Resolução:</strong> HD</li><li><strong>Conectividade:</strong> HDMI + VGA</li></ul>`,
  },
  {
    title: "Toner Compatível Premium 285A Preto para HP LaserJet",
    handle: "toner-premium-285a",
    vendor: "Premium",
    productType: "Toners",
    tags: ["categoria-toners", "marca-premium", "compativel-hp"],
    price: "40.00",
    sku: "PREM-285A",
    descriptionHtml: `<p>Toner compatível <strong>HP 285A</strong> — solução econômica para a linha LaserJet P1102, P1102w, M1132 e M1212.</p>
<h3>Principais características</h3>
<ul><li>Compatibilidade HP 85A</li><li>Rendimento ~1.600 páginas</li><li>Pó de toner uniforme</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Premium</li><li><strong>Modelo:</strong> 285A / CE285A</li><li><strong>Cor:</strong> Preto</li></ul>
<h3>Compatibilidade</h3>
<p>HP LaserJet P1102, P1102W, M1132, M1212NF, M1217.</p>`,
  },
  {
    title: "Cilindro DR3470 Drum DR820 DR3440 DR3472 Fotocondutor",
    handle: "cilindro-dr3470-byqualy",
    vendor: "Byqualy",
    productType: "Toners",
    tags: ["categoria-toners", "marca-byqualy", "compativel-brother", "cilindro"],
    price: "55.00",
    sku: "BYQ-DR3470",
    descriptionHtml: `<p>Cilindro fotocondutor compatível <strong>Brother DR3470 / DR820 / DR3440</strong>. Reposição obrigatória após 30.000 páginas para manter qualidade de impressão.</p>
<h3>Principais características</h3>
<ul><li>Compatibilidade Brother DR3470 / DR820 / DR3440 / DR3472</li><li>Vida útil ~30.000 páginas</li><li>Construção robusta</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Byqualy</li><li><strong>Modelo:</strong> DR3470 / DR820 / DR3440</li><li><strong>Tipo:</strong> Cilindro/Drum</li></ul>`,
  },
  {
    title: "Toner Compatível Brother TN1060 Preto HL1202 DCP1617 1500 Impressões",
    handle: "toner-brother-tn1060-evolut-1500",
    vendor: "Evolut",
    productType: "Toners",
    tags: ["categoria-toners", "marca-evolut", "compativel-brother"],
    price: "25.00",
    sku: "EVO-TN1060-1500",
    descriptionHtml: `<p>Toner compatível <strong>Brother TN1060</strong> com rendimento estendido de 1.500 impressões. Mais páginas, mesmo preço.</p>
<h3>Principais características</h3>
<ul><li>Rendimento ~1.500 páginas (cobertura 5%)</li><li>Compatibilidade testada</li><li>Pó de toner uniforme</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Evolut</li><li><strong>Modelo:</strong> TN1060</li><li><strong>Cor:</strong> Preto</li></ul>
<h3>Compatibilidade</h3>
<p>Brother HL-1202, HL-1212, DCP-1510, DCP-1617, MFC-1810.</p>`,
  },
  {
    title: "Placa de Vídeo Nvidia Gamer GeForce GT 730 Clanm",
    handle: "gpu-nvidia-gt-730-clanm-promo",
    vendor: "Clanm",
    productType: "Periféricos",
    tags: ["categoria-perifericos", "marca-clanm", "placa-video", "gpu", "promo"],
    price: "299.30",
    compareAtPrice: "412.00",
    sku: "CLANM-GT730-PROMO",
    descriptionHtml: `<p>Placa de vídeo <strong>Nvidia GeForce GT 730</strong> da Clanm em <strong>oferta de 27% OFF</strong> — entrada perfeita para PC de escritório com aceleração gráfica.</p>
<h3>Principais características</h3>
<ul><li>Memória 4GB DDR3</li><li>Saídas HDMI, VGA e DVI</li><li>Refrigeração ativa</li><li>Compatível PCIe x16</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Clanm</li><li><strong>Modelo:</strong> GeForce GT 730</li><li><strong>Memória:</strong> 4GB DDR3</li></ul>`,
  },
  {
    title: "Toner Compatível Samsung D111 D111S M2020 M2070 M2070W",
    handle: "toner-samsung-d111-premium",
    vendor: "Premium",
    productType: "Toners",
    tags: ["categoria-toners", "marca-premium", "compativel-samsung"],
    price: "37.50",
    sku: "PREM-D111",
    descriptionHtml: `<p>Toner compatível <strong>Samsung MLT-D111S</strong>. Solução econômica para a série Xpress da Samsung.</p>
<h3>Principais características</h3>
<ul><li>Rendimento ~1.000 páginas</li><li>Compatibilidade Samsung Xpress</li><li>Pó de toner uniforme</li></ul>
<h3>Especificações</h3>
<ul><li><strong>Marca:</strong> Premium</li><li><strong>Modelo:</strong> D111 / D111S</li><li><strong>Cor:</strong> Preto</li></ul>
<h3>Compatibilidade</h3>
<p>Samsung Xpress M2020, M2070, M2070W, M2070FW, M2022.</p>`,
  },
];

console.log(`Coleções: ${COLLECTIONS.length} | Produtos: ${PRODUCTS.length}\n`);

const COLLECTION_QUERY = `mutation collectionCreate($input: CollectionInput!) { collectionCreate(input: $input) { collection { id title handle } userErrors { field message } } }`;

const PRODUCT_QUERY = `mutation productSet($input: ProductSetInput!) { productSet(input: $input) { product { id title handle status } userErrors { field message } } }`;

const PUBLISH_QUERY = `mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { field message } } }`;

console.log("=== Criando coleções ===");
const collectionResults = [];
for (const c of COLLECTIONS) {
  const r = exec(COLLECTION_QUERY, {
    input: {
      title: c.title,
      handle: c.handle,
      descriptionHtml: c.descriptionHtml,
      ruleSet: {
        appliedDisjunctively: false,
        rules: [{ column: "TAG", relation: "EQUALS", condition: c.tag }],
      },
    },
  });
  const errs = r.collectionCreate.userErrors;
  if (errs.length) {
    console.error(`  ✗ ${c.title}:`, errs);
  } else {
    console.log(`  ✓ ${c.title} (${r.collectionCreate.collection.id})`);
    collectionResults.push(r.collectionCreate.collection);
  }
}

console.log("\n=== Publicando coleções no Online Store ===");
for (const col of collectionResults) {
  const r = exec(PUBLISH_QUERY, {
    id: col.id,
    input: [{ publicationId: PUBLICATION_ID }],
  });
  const errs = r.publishablePublish.userErrors;
  if (errs.length) console.error(`  ✗ ${col.title}:`, errs);
  else console.log(`  ✓ ${col.title} publicada`);
}

console.log("\n=== Criando produtos ===");
const productResults = [];
for (const p of PRODUCTS) {
  const variant = {
    optionValues: [{ optionName: "Título", name: "Padrão" }],
    price: p.price,
    sku: p.sku,
    inventoryPolicy: "DENY",
  };
  if (p.compareAtPrice) variant.compareAtPrice = p.compareAtPrice;
  const input = {
    title: p.title,
    handle: p.handle,
    descriptionHtml: p.descriptionHtml,
    vendor: p.vendor,
    productType: p.productType,
    tags: p.tags,
    status: "ACTIVE",
    productOptions: [{ name: "Título", values: [{ name: "Padrão" }] }],
    variants: [variant],
    files: [
      {
        originalSource: placeholder(p.title.split(" - ")[0]),
        contentType: "IMAGE",
        alt: p.title,
      },
    ],
  };
  const r = exec(PRODUCT_QUERY, { input });
  const errs = r.productSet.userErrors;
  if (errs.length) {
    console.error(`  ✗ ${p.title}:`, errs);
  } else {
    console.log(`  ✓ ${p.title}`);
    productResults.push(r.productSet.product);
  }
}

console.log("\n=== Publicando produtos no Online Store ===");
for (const prod of productResults) {
  const r = exec(PUBLISH_QUERY, {
    id: prod.id,
    input: [{ publicationId: PUBLICATION_ID }],
  });
  const errs = r.publishablePublish.userErrors;
  if (errs.length) console.error(`  ✗ ${prod.title}:`, errs);
}

console.log(`\n✅ Concluído. ${collectionResults.length}/${COLLECTIONS.length} coleções, ${productResults.length}/${PRODUCTS.length} produtos.`);
