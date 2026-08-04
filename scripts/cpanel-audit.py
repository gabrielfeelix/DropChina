#!/usr/bin/env python3
"""
Auditoria READ-ONLY do cPanel da DropChina via UAPI.

Levanta a zona DNS completa, as contas de e-mail com uso de disco, a quota da
conta e o status de SPF/DKIM — o que não dá pra ver consultando DNS por fora.

    python3 scripts/cpanel-audit.py

Lê CPANEL_TOKEN do .env da raiz do repo (gitignored). Não escreve nada no servidor.
"""
import base64
import json
import os
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request

HOST = "cpl27.main-hosting.eu:2083"
USER = "dropchinaoficial"
DOMAIN = "dropchinaoficial.com.br"

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def token():
    caminho = os.path.join(RAIZ, ".env")
    with open(caminho) as f:
        for linha in f:
            if linha.strip().startswith("CPANEL_TOKEN="):
                return linha.split("=", 1)[1].strip()
    sys.exit("CPANEL_TOKEN não encontrado no .env")


TOKEN = token()
CTX = ssl.create_default_context()


def uapi(modulo, funcao, **params):
    url = f"https://{HOST}/execute/{modulo}/{funcao}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"Authorization": f"cpanel {USER}:{TOKEN}"})
    try:
        with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
            d = json.load(r)
    except urllib.error.HTTPError as e:
        return {"_erro": f"HTTP {e.code} {e.reason}"}
    except Exception as e:
        return {"_erro": f"{type(e).__name__}: {e}"}
    if d.get("errors"):
        return {"_erro": "; ".join(map(str, d["errors"]))}
    return d.get("data", d)


def cabecalho(t):
    print(f"\n{'=' * 70}\n{t}\n{'=' * 70}")


# ---------------------------------------------------------------- zona DNS
cabecalho("ZONA DNS COMPLETA")
z = uapi("DNS", "parse_zone", zone=DOMAIN)
if isinstance(z, dict) and z.get("_erro"):
    print("  ERRO:", z["_erro"])
else:
    for linha in z:
        if linha.get("type") != "record":
            continue
        campos = [
            base64.b64decode(x).decode("utf-8", "replace") if isinstance(x, str) else str(x)
            for x in linha.get("data_b64", [])
        ]
        nome = base64.b64decode(linha["dname_b64"]).decode("utf-8", "replace") if linha.get("dname_b64") else "?"
        tipo = base64.b64decode(linha["record_type_b64"]).decode("utf-8", "replace") if linha.get("record_type_b64") else linha.get("type", "?")
        if tipo in ("SOA",):
            continue
        print(f"  {tipo:8} {nome:45} {' '.join(campos)}")

# ------------------------------------------------------------ contas email
cabecalho("CONTAS DE E-MAIL")
contas = uapi("Email", "list_pops_with_disk")
if isinstance(contas, dict) and contas.get("_erro"):
    print("  ERRO:", contas["_erro"])
else:
    for c in contas:
        usado = c.get("humandiskused", c.get("diskused", "?"))
        quota = c.get("humandiskquota", c.get("diskquota", "?"))
        print(f"  {c.get('email', c.get('user','?')):45} usado {usado:>10}  de {quota}")
    print(f"\n  total: {len(contas)} caixas")

# -------------------------------------------------------------- encaminhad.
cabecalho("ENCAMINHADORES (forwarders)")
fw = uapi("Email", "list_forwarders")
if isinstance(fw, dict) and fw.get("_erro"):
    print("  ERRO:", fw["_erro"])
elif not fw:
    print("  (nenhum)")
else:
    for f in fw:
        print(f"  {f.get('dest','?'):45} → {f.get('forward','?')}")

# -------------------------------------------------------------- SPF / DKIM
cabecalho("SPF / DKIM (Email Deliverability)")
for fn in ("fetch_dkim_and_spf_status", "get_dkim_and_spf_status"):
    st = uapi("EmailAuth", fn, domain=DOMAIN)
    if not (isinstance(st, dict) and st.get("_erro")):
        print(json.dumps(st, indent=2, ensure_ascii=False)[:2500])
        break
else:
    print("  (não disponível nesta versão da UAPI — conferir na tela Email Deliverability)")

# ------------------------------------------------------------------ quota
cabecalho("USO DE DISCO DA CONTA")
q = uapi("Quota", "get_quota_info")
if isinstance(q, dict) and q.get("_erro"):
    print("  ERRO:", q["_erro"])
else:
    print(json.dumps(q, indent=2, ensure_ascii=False)[:1200])


def bloco(titulo, modulo, funcao, resumo=None, **params):
    """Chama a UAPI e imprime — resumo(d) pode formatar em vez do JSON cru."""
    cabecalho(titulo)
    d = uapi(modulo, funcao, **params)
    if isinstance(d, dict) and d.get("_erro"):
        print("  (indisponível:", d["_erro"], ")")
        return None
    if d in ([], {}, None):
        print("  (vazio)")
        return d
    if resumo:
        resumo(d)
    else:
        print(json.dumps(d, indent=2, ensure_ascii=False)[:2500])
    return d


# ---- QUEM MAIS TEM ACESSO ------------------------------------------------
bloco(
    "TOKENS DE API EXISTENTES (quem mais tem acesso programático)",
    "APITokens", "list_tokens",
    lambda d: [print(f"  {t.get('name','?'):30} criado {t.get('create_time','?')}  expira {t.get('expires_at') or 'NUNCA'}") for t in (d or [])],
)

bloco(
    "USUÁRIOS DE EQUIPE (Manage Team)",
    "Team", "list_users",
    lambda d: [print(f"  {u.get('username','?'):30} {u.get('roles','')} {u.get('notes','')}") for u in (d or [])],
)

bloco(
    "CONTAS DE FTP",
    "Ftp", "list_ftp",
    lambda d: [print(f"  {f.get('user','?'):40} dir {f.get('dir','?')}") for f in (d or [])],
)

bloco(
    "E-MAIL DE CONTATO DA CONTA (quem recebe alerta de cota/expiração)",
    "CustInfo", "get_email_addresses",
)

# ---- IDENTIDADE DA CONTA / PLANO ----------------------------------------
bloco("INFORMAÇÕES DO USUÁRIO", "Variables", "get_user_information")
bloco(
    "PLANO / PACOTE E DONO DA CONTA",
    "StatsBar", "get_stats",
    display="plan|owner|hostname|theme|cpanelversion|machinetype|sharedip|addondomains|mysqldiskusage",
)

# ---- E-MAIL: CONFIG QUE AFETA MIGRAÇÃO ----------------------------------
bloco(
    "DOMÍNIOS DE E-MAIL E ROTEAMENTO",
    "Email", "list_mail_domains",
    lambda d: [print(f"  {m.get('domain','?'):40} {m.get('status','')}") for m in (d or [])],
)
bloco("FILTROS DE E-MAIL", "Email", "list_filters", account=DOMAIN)
bloco("RESPONDEDORES AUTOMÁTICOS", "Email", "list_auto_responders", domain=DOMAIN)

# ---- OUTROS -------------------------------------------------------------
bloco(
    "DOMÍNIOS NA CONTA",
    "DomainInfo", "list_domains",
)
bloco(
    "CERTIFICADOS SSL INSTALADOS",
    "SSL", "installed_hosts",
    lambda d: [print(f"  {h.get('servername','?'):45} emissor {h.get('issuer_organizationName','?')}  vence {h.get('not_after','?')}") for h in (d or [])],
)
bloco("TAREFAS AGENDADAS (cron)", "Cron", "list_lines")

print()
