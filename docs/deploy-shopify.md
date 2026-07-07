# Deploy do tema Shopify (DropChina)

Guia rápido pra **qualquer agente/dev** subir mudanças do `theme/` pro ar. O deploy é via **Shopify CLI** (não tem build/compilação — Shopify valida o Liquid no push).

## Coordenadas da loja
- **Domínio permanente (usar no CLI):** `akfd19-1c.myshopify.com`
- Domínio público: `dropchinaoficial.com.br`
- **Tema MAIN (live) id:** `161970290907`
- Pasta do tema no repo: `theme/`
- Plano: Basic (1 admin). Titular: Gabriel (UX) — transferência p/ Augusto pendente.

## Autenticação (1ª vez)
```bash
shopify theme list --store akfd19-1c.myshopify.com --path theme
```
Abre login por device-code. Depois fica autenticado.

## Deploy (SEMPRE cirúrgico — nunca cego)
Suba **só os arquivos que mudou** com `--only` (repita por arquivo):
```bash
shopify theme push --store akfd19-1c.myshopify.com --path theme --theme 161970290907 \
  --allow-live --nodelete \
  --only sections/dc-pdp.liquid \
  --only snippets/meta-tags.liquid
```
- `--allow-live` = permite subir no tema publicado (é o único tema).
- `--nodelete` = não apaga nada remoto.
- ⚠️ **NUNCA rode `shopify theme push` sem `--only`.** Um push cego **apaga assets que só existem no live** (ex.: `banner-impressoras-*.jpeg`, banners subidos pelo painel) e sobrescreve config do Admin editor. Quebra a loja.

## Sincronizar git com o live (pull)
```bash
shopify theme pull --store akfd19-1c.myshopify.com --path theme --theme 161970290907 --nodelete
```
Traz o estado live pro `theme/` local (assets remotos, config do editor). Rode isto **antes** de editar `templates/*.json` ou `sections/*-group.json`.

## ⚠️ Arquivos auto-gerados pelo Admin theme editor
`templates/index.json`, `sections/header-group.json`, `sections/footer-group.json` etc. têm header `/* auto-generated ... */` e **são reescritos pelo painel**. O live pode divergir do git. **Sempre `theme pull` esses antes de mexer**, senão você atropela mudanças feitas no painel (ex.: banners, ordem de seções).

Pra validar JSON deles (tem o comentário no topo):
```bash
python3 -c "import json,re; s=open('theme/templates/index.json').read(); json.loads(re.sub(r'^\s*/\*.*?\*/','',s,flags=re.S)); print('OK')"
```

## Fluxo padrão (build → commit → push → deploy)
```bash
# 1. build/lint (valida Liquid; Shopify também valida no push)
shopify theme check --path theme --fail-level error

# 2. commit
git add theme/<arquivos>
git commit -m "fix(theme): ..."

# 3. push GitHub
git push origin <branch>

# 4. deploy live (cirúrgico)
shopify theme push --store akfd19-1c.myshopify.com --path theme --theme 161970290907 --allow-live --nodelete --only <arquivos>
```
Meta: **GitHub == git local == tema live**, sempre sincronizados.

> Também documentado na memória do projeto: `dropchina-shopify-operavel`.
