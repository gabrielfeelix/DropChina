# Acesso ML — o que o dev faz e o que pedir pro Augusto

> Contexto: Gabriel (dev externo) constrói o cliente **read-only** da API do ML. Augusto é o dono da conta vendedora (MercadoLíder Platinum). Pergunta: quem cria o quê?

## Modelo (importante entender)
No ML, **app** e **autorização** são coisas separadas:
- **App** (DevCenter) → tem dono (a conta que o criou). Gera `client_id` + `secret`.
- **Autorização** (OAuth) → o vendedor loga e libera o app a acessar os dados dele.

Um app de uma conta pode ser autorizado por **outra** conta. Então **o dev cria o app na própria conta** e o Augusto **só autoriza**.

Regras firmes (fonte oficial):
- Quem autoriza **tem que ser o admin/dono** da conta vendedora (Augusto na conta principal). Operador/colaborador → erro `invalid_operator_user_id`.
- **Colaborador/operador** do ML serve só pra funções de venda — **não** cria nem autoriza app, e **não** dá acesso ao DevCenter.
- **Não existe** logar no DevCenter de outra conta sem a senha dela (sem delegação/equipe). Transferência de app entre contas só via suporte ML.

> Este app read-only é **ferramenta de dev** (puxar/auditar catálogo). NÃO é a integração de produção — o sync ML↔Bling do go-live é o conector **nativo do Bling** (Augusto pluga o ML no painel do Bling). Por isso a propriedade do app aqui não importa pro handover.

---

## ✅ CAMINHO RECOMENDADO — app na conta do dev (Gabriel)

**O que o Gabriel faz (sozinho, sem o Augusto):**
1. Logar em https://developers.mercadolivre.com.br com **sua própria conta ML** (se não tiver, criar uma).
2. Criar a aplicação (ver campos no [`00_Checklist_DevCenter_ML.md`](00_Checklist_DevCenter_ML.md)): redirect HTTPS, scopes **read + offline_access** (sem write), PKCE off.
3. Pegar `client_id` + `secret` → preencher o `.env` do `mcp-meli`.
4. Gerar a URL de autorização (`npm run authorize`) e enviar pro Augusto.

**O que pedir pro Augusto (mínimo) — mensagem pronta abaixo.** Ele só precisa: clicar no link, autorizar logado na conta principal, e te mandar o `code`.

---

## 📨 Mensagem pronta pra enviar ao Augusto (Caminho recomendado)

> Augusto, preciso de **2 minutos** seus pra liberar a leitura do catálogo do seu Mercado Livre (é **só leitura** — não altera, não pausa, não mexe em anúncio nem venda).
>
> 1. **Importante:** faça login no Mercado Livre com a sua **conta principal** (a de dono/admin — não uma conta de colaborador/operador), no navegador.
> 2. Abra este link (eu te mando): **[LINK DE AUTORIZAÇÃO]**
> 3. Vai aparecer uma tela "Autorizar [nome do app] a acessar sua conta". Clique em **Autorizar**.
> 4. O navegador vai redirecionar pra um endereço que pode dar **erro/página não encontrada** — **isso é normal**. O que eu preciso está **na barra de endereço (a URL no topo)**: tem um trecho `?code=XXXXXXXX`.
> 5. **Copie a URL inteira da barra** (ou só o valor depois de `code=`) e me mande.
>
> Pronto. Se a tela disser algo como "operador" ou der erro de permissão, é porque o login foi numa conta secundária — repita logando na conta **principal**. O link expira rápido, então me avisa quando for abrir que a gente faz na hora.

---

## Alternativa — app na conta do Augusto (se quiserem propriedade no cliente)

Só vale se quiserem que o app pertença ao Augusto desde já (não é necessário, já que a produção é via Bling nativo). Nesse caso, Augusto faz no DevCenter (Gabriel guia pelo `00_Checklist`):
1. Logar em https://developers.mercadolivre.com.br na **conta principal** e **criar a aplicação** (campos do checklist).
2. Repassar `client_id` + `secret` pro Gabriel (tratar como segredo — mandar por canal seguro, não em grupo).
3. Fazer o passo de **Autorizar** (mesma coisa da mensagem acima).
Contra: mais trabalho pro Augusto e ele lida com o DevCenter.

---

## Checklist objetivo do que pedir ao Augusto
- [ ] Confirmar que vai logar na **conta principal/admin** (não colaborador).
- [ ] Conta **sem bloqueio/pendência de KYC**.
- [ ] (Caminho recomendado) Só **autorizar** o link e mandar o `code`.
- [ ] (Alternativa) Criar o app e repassar `client_id`/`secret` por canal seguro.

## Fontes
- [Autenticação e Autorização](https://developers.mercadolivre.com.br/pt_br/autenticacao-e-autorizacao) · [Criar aplicação](https://developers.mercadolivre.com.br/pt_br/crie-uma-aplicacao-no-mercado-livre) · [Convidar colaborador (ajuda 4026)](https://www.mercadolivre.com.br/ajuda/4026)
