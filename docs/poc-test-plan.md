# PoC test plan

## Namen

Dokazati, da Outlook ob ustvarjanju sporočila samodejno zažene add-in in vstavi podpis, ki je viden pred pošiljanjem.

## Predpogoji

- Microsoft 365 mailbox.
- Outlook klient z Mailbox requirement setom 1.10.
- GitHub Pages deployment je uspešen.
- `manifest.xml` je dodeljen samo pilotnemu uporabniku.
- Klasični Outlook podpis je za pilotni račun začasno izklopljen, da ne nastane dvojni podpis.

## Preizkusi

1. V brskalniku odpri `https://bubinjo.github.io/bdev-signatures/runtime.html` in preveri HTTP 200.
2. V Outlook on the web ustvari nov email. Pričakovan rezultat: prikaže se polni B.DEV testni podpis.
3. Odgovori na obstoječ email. Pričakovan rezultat: prikaže se krajši podpis brez telefonov in povezav.
4. Posreduj obstoječ email. Pričakovan rezultat: prikaže se krajši podpis.
5. Odpri gumb **B.DEV podpis** in izberi ročni preizkus. Pričakovan rezultat: status potrdi vstavljanje.
6. Ponovi korake v new Outlooku in classic Outlooku, če sta na voljo.

## Uspeh PoC

PoC je uspešen, ko avtomatsko vstavljanje deluje za new mail, reply in forward v Outlook on the web ter vsaj enem namiznem Outlook klientu.

## Znane omejitve v0.1

- Profil je statičen in še ni povezan z Entra ID.
- Podpis je enak za vse pilotne uporabnike.
- Ni podpore za shared mailboxe ali send-as scenarije.
- Telefonske številke in vizualni slog so testni podatki.
