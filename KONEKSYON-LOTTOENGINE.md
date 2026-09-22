# TCHÈK ak LottoEngine sou Mac

Double-klike `Louvri-TCHEK.command` nan Finder. Li louvri http://127.0.0.1:4178/ epi konekte ak baz rezilta LottoEngine ki sou menm Mac la. Kenbe fenèt Terminal lansè a ouvè. LottoEngine dwe kontinye resevwa/apwouve rezilta yo.

Alèt yo parèt sèlman andedan TCHÈK. Rezilta yo rafrechi sou ouvèti, lè ou retounen sou ekran an, ak chak minit pandan li vizib. Bouton yo pèmèt etenn alèt GYD oswa ansyen tchek la; chwa sa yo konsève sou aparèy la.

TCHÈK chwazi pwochen tiraj la selon rezilta ki deja disponib jodi a. Ou ka chanje dat/sesyon pou verifye yon tiraj. Li li 10 dènye jou yo. Done manke rete an atant; li pa ranplase yon sous manke ak yon lòt jou.

GYD sèvi ak 3 lo menm sesyon jou anvan an. Twa alèt rechèch Florida swa → swa yo endepandan: premye lo ekate 2; twazyèm lo fo doub; oswa 34/43 nan youn nan 3 lo yo. Yo pa garanti rezilta.

Ansyen tchek la sipòte midi+swa, midi+midi ak swa+swa; 2 boul yo ka soti nan menm tiraj sous la. Pick 3: tout pozisyon; Pick 4: devan/dèyè sèlman. Fo doub konvèti ak chif komen pou ekate 1/2, epi rete dirèk pou ekate 3/4. Ekran an montre follower komen ak entèseksyon GYD/piramid. Li rekonèt ranvèse san afiche chak boul de fwa.

Konektè Python an li rezilta apwouve sèlman, ak SQLite `mode=ro` epi `query_only`. Li pa modifye LottoEngine. Li koute sou 127.0.0.1:4179 sèlman. Sa pa yon koneksyon telefòn oswa sèvè nwaj: konektè a dwe mache sou menm Mac ak navigatè a. Lè mizajou sit piblik la disponib, navigatè a ka mande aksè rezo lokal pou koneksyon an.

Verifikasyon: 217 tès pase, build ak lint pase. 450 konparezon matche ak vèsyon piblik referans la; 196 egzanp GYD valide. Fichye VERIFICATION.json bay detay. Sit piblik la poko mete ajou nan moman preparasyon sa a.

## Tout lotri LottoEngine

Lis lotri ak sesyon yo soti nan baz LottoEngine la: 48 lotri nan verifikasyon 22 septanm. Maten, midi, swa, lannuit ak lè presi rete diferan. Pou quiniela/borlette, tchek la sèvi ak 3 lo dirèkteman, san envante Pick 3 oswa Pick 4. GYD sèvi ak menm sesyon jou anvan; ansyen tchek la sèvi ak 2 plas sous ki nesesè yo. Sesyon yo sòti nan istwa baz la, pa yon kalandriye ofisyèl: yon jou san tiraj rete an atant. Alèt rechèch espesyal Florida yo pa aplike sou lòt lotri.

## GYD sèlman — Backtest

Anba tchek otomatik la, louvri GYD sèlman · Backtest. Chwazi lotri, sesyon, premye/dènye dat, epi Teste GYD. Chak dat sèvi ak menm sesyon jou kalandriye anvan an; konektè a chaje jou sous anvan kòmansman an tou. Li teste tout boul GYD yo sou 3 lo sib yo, san piramid, san entèseksyon ak ansyen tchek la, san filtre alèt Florida yo. Anvè konte; chak sesyon frape konte yon fwa. De oswa twa boul diferan konte kòm fanmi ranvèse diferan. Done manke rete an atant, pa nan denominatè a. Peryòd maksimòm: 367 jou, selon done apwouve ki deja nan LottoEngine. Jou san tiraj pa envante yon sous ranplasman. Rezilta yo se tès istorik, pa swivi alavans.
