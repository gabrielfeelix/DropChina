#!/usr/bin/env bash
# Testa se o token Shopify no .env funciona.
# Uso: ./scripts/test-token.sh

set -euo pipefail

# Carrega .env
if [ ! -f .env ]; then
  echo "❌ .env não encontrado. Cria a partir de .env.example primeiro."
  exit 1
fi

export $(grep -v '^#' .env | grep -v '^$' | xargs)

if [ -z "${SHOPIFY_ADMIN_API_TOKEN:-}" ] || [ "$SHOPIFY_ADMIN_API_TOKEN" = "shpat_PASTE_YOUR_TOKEN_HERE" ]; then
  echo "❌ SHOPIFY_ADMIN_API_TOKEN não configurado em .env"
  exit 1
fi

if [ -z "${SHOPIFY_STORE_DOMAIN:-}" ]; then
  echo "❌ SHOPIFY_STORE_DOMAIN não configurado em .env"
  exit 1
fi

API_VERSION="${SHOPIFY_API_VERSION:-2026-01}"
ENDPOINT="https://${SHOPIFY_STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json"

echo "🔌 Testando conexão com $SHOPIFY_STORE_DOMAIN ..."
echo ""

# Test 1: shop info (basic auth check)
RESPONSE=$(curl -s -w "\n___HTTP_STATUS:%{http_code}" \
  -X POST "$ENDPOINT" \
  -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ shop { name myshopifyDomain primaryDomain { url } } }"}' \
  --max-time 10)

BODY=$(echo "$RESPONSE" | sed -e 's/___HTTP_STATUS:.*//')
STATUS=$(echo "$RESPONSE" | grep -oE '___HTTP_STATUS:[0-9]+' | cut -d: -f2)

echo "HTTP Status: $STATUS"
echo ""

if [ "$STATUS" != "200" ]; then
  echo "❌ Falhou ($STATUS):"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  exit 1
fi

if echo "$BODY" | grep -q '"errors"'; then
  echo "❌ Token inválido:"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  exit 1
fi

echo "✅ Conectado com sucesso!"
echo ""
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"

echo ""
echo "🔍 Testando escopo write_products (listar produtos)..."
PRODS=$(curl -s \
  -X POST "$ENDPOINT" \
  -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ products(first: 5) { nodes { id title handle } } }"}' \
  --max-time 10)

if echo "$PRODS" | grep -q '"errors"'; then
  echo "⚠️  Escopo de produtos faltando ou erro:"
  echo "$PRODS" | python3 -m json.tool 2>/dev/null || echo "$PRODS"
else
  COUNT=$(echo "$PRODS" | python3 -c "import sys, json; print(len(json.load(sys.stdin)['data']['products']['nodes']))" 2>/dev/null || echo "?")
  echo "✅ $COUNT produtos lidos com sucesso (escopo write_products/read_products OK)"
fi

echo ""
echo "🎉 Token válido! Pronto pra usar na extension."
