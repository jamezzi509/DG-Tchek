# TCHÈK ak LottoEngine sou Mac

Double-klike `Louvri-TCHEK.command` nan Finder. Li louvri http://127.0.0.1:4178/ epi konekte ak baz rezilta LottoEngine ki sou menm Mac la. Kenbe fenèt Terminal lansè a ouvè. LottoEngine dwe kontinye resevwa/apwouve rezilta yo.

Alèt yo parèt sèlman andedan TCHÈK. Rezilta yo rafrechi sou ouvèti, lè ou retounen sou ekran an, ak chak minit pandan li vizib. Bouton yo pèmèt etenn alèt GYD oswa ansyen tchek la; chwa sa yo konsève sou aparèy la.

TCHÈK chwazi pwochen tiraj la selon rezilta ki deja disponib jodi a. Ou ka chanje dat/sesyon pou verifye yon tiraj. Li li 10 dènye jou yo. Done manke rete an atant; li pa ranplase yon sous manke ak yon lòt jou.

GYD sèvi ak 3 lo menm sesyon jou anvan an. Twa alèt rechèch Florida swa → swa yo endepandan: premye lo ekate 2; twazyèm lo fo doub; oswa 34/43 nan youn nan 3 lo yo. Yo pa garanti rezilta.

Ansyen tchek la sipòte midi+swa, midi+midi ak swa+swa; 2 boul yo ka soti nan menm tiraj sous la. Pick 3: tout pozisyon; Pick 4: devan/dèyè sèlman. Fo doub konvèti ak chif komen pou ekate 1/2, epi rete dirèk pou ekate 3/4. Ekran an montre follower komen ak entèseksyon GYD/piramid. Li rekonèt ranvèse san afiche chak boul de fwa.

Konektè Python an li rezilta apwouve sèlman, ak SQLite `mode=ro` epi `query_only`. Li pa modifye LottoEngine. Li koute sou 127.0.0.1:4179 sèlman. Sa pa yon koneksyon telefòn oswa sèvè nwaj: konektè a dwe mache sou menm Mac ak navigatè a. Lè mizajou sit piblik la disponib, navigatè a ka mande aksè rezo lokal pou koneksyon an.

Verifikasyon: 215 tès pase, build ak lint pase. 450 konparezon matche ak vèsyon piblik referans la; 196 egzanp GYD valide. Fichye VERIFICATION.json bay detay. Sit piblik la poko mete ajou nan moman preparasyon sa a.
