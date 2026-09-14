# B.DEV Signatures

PoC Outlook add-in za centralno upravljan podpis, ki je viden že med pisanjem sporočila.

## Kaj vsebuje v0.1

- event-based aktivacijo `OnNewMessageCompose`,
- `setSignatureAsync()` za vstavljanje podpisa,
- polni podpis za nov mail,
- kompaktni podpis za reply/forward,
- ročni testni gumb v Outlook task panu,
- statično gostovanje prek GitHub Pages,
- teste in GitHub Actions workflow.

V tej fazi so podatki namenoma statični. Namen PoC je najprej dokazati zanesljivo aktivacijo in vstavljanje podpisa. Microsoft Graph in Entra ID sta naslednja faza.

## Arhitektura PoC

```text
Outlook
  -> OnNewMessageCompose
  -> GitHub Pages runtime
  -> applyBdevSignature()
  -> getComposeTypeAsync()
  -> full ali compact HTML
  -> setSignatureAsync()
```

## Lokalna verifikacija

Projekt nima produkcijskih npm odvisnosti.

```bash
npm test
npm run build
```

Build pripravi mapo `dist/`, ki jo GitHub Actions objavi na Pages.

## Objava in namestitev

1. Ustvari GitHub repo `Bubinjo/bdev-signatures` z vejo `main`.
2. Potisni vsebino tega projekta v repo.
3. V GitHubu odpri **Settings -> Pages** in kot source izberi **GitHub Actions**.
4. Po uspešnem workflowu preveri `https://bubinjo.github.io/bdev-signatures/runtime.html`.
5. Prenesi objavljeni `https://bubinjo.github.io/bdev-signatures/manifest.xml`.
6. V Microsoft 365 admin centru odpri **Settings -> Integrated apps -> Upload custom apps**.
7. Naloži manifest in ga za pilot dodeli samo svojemu računu.
8. Po propagaciji odpri Outlook on the web in ustvari novo sporočilo.

Pred preizkusom za pilotni račun začasno izklopi običajen Outlook podpis, sicer se lahko prikažeta dva podpisa.

Podroben postopek je v [PoC test planu](docs/poc-test-plan.md).

## Naslednja faza

- Entra app registration,
- Microsoft 365 SSO,
- backend API z OAuth On-Behalf-Of tokom,
- Microsoft Graph `/me` profil,
- dinamična polja in obravnava praznih atributov,
- cache in fallback vedenje.

## Tehnična osnova

Projekt sledi Microsoftovemu vzorcu za Outlook event-based activation in uporablja Mailbox requirement set 1.10:

- <https://learn.microsoft.com/en-us/samples/officedev/office-add-in-samples/outlook-add-in-set-signature/>
- <https://learn.microsoft.com/en-us/office/dev/add-ins/develop/event-based-activation>
