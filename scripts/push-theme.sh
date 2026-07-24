#!/usr/bin/env bash
#
# Push do tema DropChina para a Shopify, com trava contra o acidente de 24/jul/2026.
#
# Naquele dia um `shopify theme push` foi rodado a partir da raiz do repo em vez de
# theme/. O CLI tratou a raiz como raiz do tema, não achou nenhum arquivo válido e o
# passo "Cleaning your remote theme" apagou TODO arquivo remoto que não existia na
# raiz — o tema inteiro, menos os 4 que a Shopify se recusa a deletar. Loja fora do ar.
#
# Este script existe para tornar esse erro impossível: ele sempre empurra theme/, e
# aborta antes de qualquer chamada ao CLI se o diretório não parecer um tema íntegro.
#
# Uso:
#   scripts/push-theme.sh              # dry run (padrão — não escreve nada)
#   scripts/push-theme.sh --live       # empurra de verdade para o tema publicado
#
set -euo pipefail

THEME_ID="161970290907"          # DropChina (MAIN)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
THEME_DIR="$REPO_ROOT/theme"

# Pastas que a Shopify reconhece. Se o diretório de push não tiver estas, o CLI
# entende "tema vazio" e o clean apaga o remoto.
REQUIRED_DIRS=(assets blocks config layout locales sections snippets templates)
MIN_FILES=400                    # tema íntegro tem ~498; bem abaixo disso é sinal de árvore truncada

die() { printf '\n\033[31mABORTADO:\033[0m %s\n\n' "$1" >&2; exit 1; }

[[ -d "$THEME_DIR" ]] || die "não achei $THEME_DIR"

# Trava 1: o marcador que faltava na raiz do repo. Sem ele não é raiz de tema.
[[ -f "$THEME_DIR/layout/theme.liquid" ]] \
  || die "$THEME_DIR não tem layout/theme.liquid — não é raiz de tema. Foi exatamente esse cenário que derrubou a loja."

# Trava 2: nenhuma pasta obrigatória pode estar faltando.
for d in "${REQUIRED_DIRS[@]}"; do
  [[ -d "$THEME_DIR/$d" ]] || die "falta a pasta obrigatória $d/ em $THEME_DIR"
done

# Trava 3: contagem mínima. Pega o caso de árvore parcial/corrompida, que passaria
# nas travas acima mas ainda assim faria o clean apagar centenas de arquivos remotos.
FILE_COUNT="$(find "$THEME_DIR" -type f | wc -l)"
[[ "$FILE_COUNT" -ge "$MIN_FILES" ]] \
  || die "só $FILE_COUNT arquivos em theme/ (esperado >= $MIN_FILES). Árvore incompleta — push apagaria o tema remoto."

# Trava 4: mudança não commitada não sobe para a loja publicada. O git é a única
# rede de segurança que temos se o push der errado de novo.
if [[ "${1:-}" == "--live" ]]; then
  if [[ -n "$(git -C "$REPO_ROOT" status --porcelain -- theme/)" ]]; then
    git -C "$REPO_ROOT" status --short -- theme/
    die "há mudanças não commitadas em theme/. Commite antes de empurrar para o tema publicado."
  fi
fi

printf '\033[32mOK\033[0m  %s  (%s arquivos, todas as pastas presentes)\n' "$THEME_DIR" "$FILE_COUNT"

cd "$THEME_DIR"   # o cd que faltou no dia do acidente

if [[ "${1:-}" == "--live" ]]; then
  printf 'Empurrando para o tema PUBLICADO #%s...\n\n' "$THEME_ID"
  exec shopify theme push --theme "$THEME_ID" --allow-live
else
  printf 'Dry run (nada é escrito). Use --live para empurrar de verdade.\n\n'
  exec shopify theme push --theme "$THEME_ID" --dry-run
fi
