# B.DEV Signatures

Outlook add-in za centralno upravljan podpis, ki je viden že med pisanjem sporočila.

## Kaj vsebuje v0.2

- event-based aktivacijo `OnNewMessageCompose`,
- `setSignatureAsync()` za vstavljanje podpisa,
- Microsoft Entra ID prijavo z MSAL Nested App Authentication (NAA),
- Microsoft Graph `/me` profil,
- polni podpis za nov mail in kompaktni podpis za reply/forward,
- interaktivno prvo prijavo v Outlook taskpanu,
- varni minimalni Office fallback, kadar Graph ni dosegljiv,
- statično gostovanje prek GitHub Pages,
- teste in GitHub Actions deployment.

## Dinamična polja

Graph poizvedba bere:

- `displayName`
- `givenName`
- `surname`
- `jobTitle`
- `department`
- `companyName`
- `businessPhones`
- `mobilePhone`
- `mail`
- `userPrincipalName`
- `officeLocation`

Prazna izbirna polja se v podpisu ne izrišejo. E-pošta uporabi `userPrincipalName`, kadar je `mail` prazen.

## Arhitektura

```text
Outlook
  -> OnNewMessageCompose
  -> MSAL Nested App Authentication
  -> Microsoft Graph /me
  -> dinamični HTML podpis
  -> setSignatureAsync()
```

NAA omogoča neposreden delegiran Graph dostop brez backend API-ja in brez client secreta.

## Entra konfiguracija

- Application (client) ID: `9d306768-45da-4299-af5f-c5ca17164d41`
- Directory (tenant) ID: `ef128b1e-9a0a-4181-88a8-1a08e037fc0a`
- SPA redirect URI: `brk-multihub://bubinjo.github.io`
- Delegated Graph permission: `User.Read`

Client ID in tenant ID nista skrivnosti. Client secreta ta projekt ne uporablja.

## Prvi zagon

1. Odpri novo sporočilo v Outlooku.
2. Odpri **Apps -> B.DEV podpis**.
3. Klikni **Poveži z Microsoft 365**.
4. Dokončaj prijavo oziroma soglasje.
5. Preveri prikazan Entra profil.
6. Zapri sporočilo in odpri nov **New Mail**.
7. Diagnostika mora prikazati `signature-success-graph`.

Če Graph še ni avtoriziran, add-in vstavi minimalni podpis iz `Office.context.mailbox.userProfile`, da nikoli ne uporabi podatkov drugega uporabnika.

## Build

```bash
npm install
npm test
npm run build
```

Build z esbuildom združi MSAL in runtime v `dist/runtime.js`, nato GitHub Actions objavi mapo `dist/` na Pages.

## Classic Outlook

Classic Outlook pri SSO iz JavaScript event runtimea dodatno zahteva datoteko
`/.well-known/microsoft-officeaddins-allowed.json` na korenu izvora. GitHub project Pages trenutno gostuje pod
`/bdev-signatures`, zato je ta korak načrtovan ločeno. Outlook on the web in new Outlook uporabljata HTML event runtime.

## Reference

- <https://github.com/OfficeDev/Office-Add-in-samples/tree/main/Samples/auth/Outlook-Event-SSO-NAA>
- <https://learn.microsoft.com/office/dev/add-ins/develop/enable-nested-app-authentication-in-your-add-in>
- <https://learn.microsoft.com/office/dev/add-ins/develop/use-sso-in-event-based-activation>
