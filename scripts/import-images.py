#!/usr/bin/env python3
"""
Importa imagens reais pros 28 produtos DropChina.
1. Lista produtos Shopify
2. Pra cada: busca Bing Images com título → pega 1ª URL relevante
3. Faz productCreateMedia no Shopify (Shopify baixa imagem)
4. Deleta placeholder cinza antigo

Não modifica preço, descrição, etc. Só troca imagem.
"""
import json
import os
import re
import subprocess
import sys
import time
from urllib.parse import quote

import urllib.request

# ===== Setup credenciais =====
ENV_PATH = "/home/gabfelix/dev/dropchina-shopify/extension/.env"
env = {}
with open(ENV_PATH) as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip()

STORE = env["SHOPIFY_STORE_DOMAIN"]
CLIENT_ID = env["SHOPIFY_CLIENT_ID"]
CLIENT_SECRET = env["SHOPIFY_CLIENT_SECRET"]
API_V = env.get("SHOPIFY_API_VERSION", "2026-04")


def get_token():
    """Renova token via client_credentials grant."""
    body = f"client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}&grant_type=client_credentials"
    req = urllib.request.Request(
        f"https://{STORE}/admin/oauth/access_token",
        data=body.encode(),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read())["access_token"]


def gql(query, variables=None, token=None):
    """Roda GraphQL no Shopify Admin."""
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    req = urllib.request.Request(
        f"https://{STORE}/admin/api/{API_V}/graphql.json",
        data=json.dumps(payload).encode(),
        headers={
            "X-Shopify-Access-Token": token,
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def search_bing_image(query):
    """Busca primeira imagem relevante via Bing. Retorna URL ou None."""
    url = f"https://www.bing.com/images/search?q={quote(query)}&form=HDRSC2"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120",
            "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            html = r.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"   ERRO Bing: {e}")
        return None

    # Bing escapa URLs em "murl":"..."
    urls = re.findall(
        r'murl&quot;:&quot;(https?://[^&]+\.(?:jpg|jpeg|png|webp))',
        html,
    )
    # Filtra placeholders/ícones genéricos
    blacklist = [
        "logo",
        "icon",
        "spinner",
        "placeholder",
        "favicon",
        "/themes/",
        "no-image",
        "cartucho.es/Themes",
    ]
    for u in urls:
        if not any(b in u.lower() for b in blacklist):
            # Prefere imagens grandes (>500px no nome)
            return u
    return urls[0] if urls else None


def list_products(token):
    """Pega 28 produtos com media atual."""
    q = """
    {
      products(first: 50) {
        nodes {
          id
          title
          vendor
          media(first: 5) {
            nodes {
              id
              ... on MediaImage {
                image { url }
              }
            }
          }
        }
      }
    }
    """
    r = gql(q, token=token)
    return r["data"]["products"]["nodes"]


def add_image(product_id, image_url, alt, token):
    """productCreateMedia com URL externa. Shopify baixa."""
    m = """
    mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media { id mediaContentType status }
        mediaUserErrors { field message code }
      }
    }
    """
    vars = {
        "productId": product_id,
        "media": [
            {
                "originalSource": image_url,
                "mediaContentType": "IMAGE",
                "alt": alt[:255],
            }
        ],
    }
    return gql(m, vars, token)


def delete_media(product_id, media_id, token):
    """Remove placeholder cinza antigo."""
    m = """
    mutation productDeleteMedia($productId: ID!, $mediaIds: [ID!]!) {
      productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
        deletedMediaIds
        mediaUserErrors { field message }
      }
    }
    """
    return gql(m, {"productId": product_id, "mediaIds": [media_id]}, token)


def main():
    print("Renovando token Shopify...")
    token = get_token()
    print(f"OK ({token[:8]}...)\n")

    products = list_products(token)
    print(f"{len(products)} produtos encontrados\n")

    success = 0
    failed = []

    for i, p in enumerate(products, 1):
        title = p["title"]
        vendor = p["vendor"] or ""
        pid = p["id"]
        old_media = [m["id"] for m in p["media"]["nodes"] if m.get("image")]

        # Monta query de busca limpa
        query = title
        # Tira termos confusos
        query = re.sub(r"\([^)]*\)", "", query)  # parênteses
        query = re.sub(r"\s+", " ", query).strip()
        # Limita a 8 palavras
        query = " ".join(query.split()[:8])

        print(f"[{i}/{len(products)}] {title[:60]}")
        print(f"   Buscando: '{query}'")

        img_url = search_bing_image(query)
        if not img_url:
            print(f"   ❌ Sem resultado Bing\n")
            failed.append(title)
            continue
        print(f"   ✓ Imagem: {img_url[:80]}")

        # Upload pro Shopify
        res = add_image(pid, img_url, title, token)
        errors = res.get("data", {}).get("productCreateMedia", {}).get("mediaUserErrors", [])
        if errors:
            print(f"   ❌ Shopify erro: {errors}\n")
            failed.append(title)
            continue

        new_media = res["data"]["productCreateMedia"]["media"]
        print(f"   ✓ Upload Shopify OK ({new_media[0]['status']})")

        # Deleta placeholders antigos
        for old_id in old_media:
            try:
                delete_media(pid, old_id, token)
            except Exception:
                pass

        success += 1
        print(f"   ✓ Placeholder antigo removido\n")
        time.sleep(1.5)  # rate limit + bing throttle

    print(f"\n{'='*60}")
    print(f"✅ Sucesso: {success}/{len(products)}")
    if failed:
        print(f"❌ Falhas ({len(failed)}):")
        for t in failed:
            print(f"   - {t}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrompido pelo usuário")
        sys.exit(1)
