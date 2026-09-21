import { escapeHtml, safeDownloadUrl } from './safe-content.js';
const projektDownloadUrl = document.querySelector("#projekt-download-url");

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";



// ========================================
// HTML ELEMENTI
// ========================================

const adminStatus =
    document.querySelector("#admin-status");

const adminSadrzaj =
    document.querySelector("#admin-sadrzaj");

const korisniciLista =
    document.querySelector("#korisnici-lista");

const adminOdjavaBtn =
    document.querySelector("#admin-odjava-btn");



// STATISTIKA

const statKlijenti =
    document.querySelector("#stat-klijenti");

const statAktivni =
    document.querySelector("#stat-aktivni");

const statZavrseni =
    document.querySelector("#stat-zavrseni");



// KONTAKTNI UPITI

const upitiLista =
    document.querySelector("#upiti-lista");

const brojNovihUpita =
    document.querySelector("#broj-novih-upita");



// MODAL

const projektModal =
    document.querySelector("#projekt-modal");

const zatvoriProjektModal =
    document.querySelector("#zatvori-projekt-modal");

const noviProjektForma =
    document.querySelector("#novi-projekt-forma");

const projektIdPolje =
    document.querySelector("#projekt-id");

const projektUserId =
    document.querySelector("#projekt-user-id");

const projektNaziv =
    document.querySelector("#projekt-naziv");

const projektUsluga =
    document.querySelector("#projekt-usluga");

const projektStatus =
    document.querySelector("#projekt-status");

const projektDatum =
    document.querySelector("#projekt-datum");

const projektFormaStatus =
    document.querySelector("#projekt-forma-status");

const odabraniKorisnikIme =
    document.querySelector("#odabrani-korisnik-ime");

const projektModalNaslov =
    document.querySelector("#projekt-modal-naslov");

const projektSubmitBtn =
    document.querySelector("#projekt-submit-btn");



// ========================================
// POMOĆNE FUNKCIJE ZA DATUM
// ========================================

function formatirajDatumZaPrikaz(vrijednost) {

    if (!vrijednost) {
        return "";
    }

    let datum;

    if (typeof vrijednost.toDate === "function") {

        datum = vrijednost.toDate();

    } else {

        datum = new Date(vrijednost);

    }

    return datum.toLocaleDateString("hr-HR");
}



function formatirajDatumZaInput(vrijednost) {

    if (!vrijednost) {
        return "";
    }

    let datum;

    if (typeof vrijednost.toDate === "function") {

        datum = vrijednost.toDate();

    } else {

        datum = new Date(vrijednost);

    }

    const godina =
        datum.getFullYear();

    const mjesec =
        String(datum.getMonth() + 1)
            .padStart(2, "0");

    const dan =
        String(datum.getDate())
            .padStart(2, "0");

    return `${godina}-${mjesec}-${dan}`;
}



// ========================================
// STATISTIKA
// ========================================

async function ucitajStatistiku() {

    try {

        const korisniciRezultat =
            await getDocs(
                collection(db, "users")
            );

        const projektiRezultat =
            await getDocs(
                collection(db, "projekti")
            );

        let brojKlijenata = 0;
        let brojAktivnih = 0;
        let brojZavrsenih = 0;


        korisniciRezultat.forEach(
            function (dokument) {

                const korisnik =
                    dokument.data();

                if (korisnik.role === "client") {
                    brojKlijenata++;
                }

            }
        );


        projektiRezultat.forEach(
            function (dokument) {

                const projekt =
                    dokument.data();

                if (projekt.status === "Završeno") {

                    brojZavrsenih++;

                } else {

                    brojAktivnih++;

                }

            }
        );


        if (statKlijenti) {
            statKlijenti.textContent =
                brojKlijenata;
        }

        if (statAktivni) {
            statAktivni.textContent =
                brojAktivnih;
        }

        if (statZavrseni) {
            statZavrseni.textContent =
                brojZavrsenih;
        }


    } catch (error) {

        console.error(
            "Greška pri učitavanju statistike:",
            error
        );

    }

}



// ========================================
// KONTAKTNI UPITI
// ========================================

async function ucitajUpite() {

    if (!upitiLista) {
        return;
    }


    try {

        const rezultat =
            await getDocs(
                collection(db, "upiti")
            );


        const upiti = [];


        rezultat.forEach(
            function (dokument) {

                upiti.push({
                    id: dokument.id,
                    ...dokument.data()
                });

            }
        );


        // NAJNOVIJI UPITI PRVI

        upiti.sort(
            function (a, b) {

                const datumA =
                    a.datum?.toMillis
                        ? a.datum.toMillis()
                        : 0;

                const datumB =
                    b.datum?.toMillis
                        ? b.datum.toMillis()
                        : 0;

                return datumB - datumA;

            }
        );


        upitiLista.innerHTML = "";


        // BROJ NOVIH UPITA

        const noviUpiti =
            upiti.filter(
                function (upit) {

                    return upit.status === "Novi";

                }
            );


        if (brojNovihUpita) {

            brojNovihUpita.textContent =
                `${noviUpiti.length} novih`;

        }


        // NEMA UPITA

        if (upiti.length === 0) {

            upitiLista.innerHTML = `
                <p class="admin-nema-upita">
                    Trenutno nema kontaktnih upita.
                </p>
            `;

            return;

        }


        // PRIKAZ UPITA

        upiti.forEach(
            function (upit) {

                const kartica =
                    document.createElement(
                        "article"
                    );


                kartica.classList.add(
                    "admin-upit-kartica"
                );


                if (upit.status === "Novi") {

                    kartica.classList.add(
                        "admin-upit-novi"
                    );

                }


                let datumUpita =
                    "Datum nije dostupan";


                if (
                    upit.datum &&
                    typeof upit.datum.toDate === "function"
                ) {

                    datumUpita =
                        upit.datum
                            .toDate()
                            .toLocaleString(
                                "hr-HR"
                            );

                }


                // ZAGLAVLJE

                const zaglavlje =
                    document.createElement(
                        "div"
                    );


                zaglavlje.classList.add(
                    "admin-upit-zaglavlje"
                );


                const informacije =
                    document.createElement(
                        "div"
                    );


                const status =
                    document.createElement(
                        "span"
                    );


                status.classList.add(
                    "admin-upit-status"
                );


                status.textContent =
                    upit.status || "Novi";


                const ime =
                    document.createElement(
                        "h3"
                    );


                ime.textContent =
                    upit.ime || "Bez imena";


                const email =
                    document.createElement(
                        "a"
                    );


                email.href =
                    `mailto:${upit.email}`;

                email.textContent =
                    upit.email || "";


                informacije.appendChild(
                    status
                );

                informacije.appendChild(
                    ime
                );

                informacije.appendChild(
                    email
                );


                const datum =
                    document.createElement(
                        "span"
                    );


                datum.classList.add(
                    "admin-upit-datum"
                );


                datum.textContent =
                    datumUpita;


                zaglavlje.appendChild(
                    informacije
                );

                zaglavlje.appendChild(
                    datum
                );


                // USLUGA

                const usluga =
                    document.createElement(
                        "p"
                    );


                usluga.classList.add(
                    "admin-upit-usluga"
                );


                usluga.textContent =
                    upit.usluga || "";


                // PORUKA

                const poruka =
                    document.createElement(
                        "p"
                    );


                poruka.classList.add(
                    "admin-upit-poruka"
                );


                poruka.textContent =
                    upit.poruka || "";


                // AKCIJE

                const akcije =
                    document.createElement(
                        "div"
                    );


                akcije.classList.add(
                    "admin-upit-akcije"
                );


                // PROČITANO

                if (upit.status === "Novi") {

                    const procitanoBtn =
                        document.createElement(
                            "button"
                        );


                    procitanoBtn.type =
                        "button";


                    procitanoBtn.classList.add(
                        "admin-upit-procitano-btn"
                    );


                    procitanoBtn.dataset.upitId =
                        upit.id;


                    procitanoBtn.textContent =
                        "PROČITANO";


                    akcije.appendChild(
                        procitanoBtn
                    );

                }


                // OBRIŠI

                const obrisiBtn =
                    document.createElement(
                        "button"
                    );


                obrisiBtn.type =
                    "button";


                obrisiBtn.classList.add(
                    "admin-upit-obrisi-btn"
                );


                obrisiBtn.dataset.upitId =
                    upit.id;


                obrisiBtn.textContent =
                    "OBRIŠI";


                akcije.appendChild(
                    obrisiBtn
                );


                kartica.appendChild(
                    zaglavlje
                );

                kartica.appendChild(
                    usluga
                );

                kartica.appendChild(
                    poruka
                );

                kartica.appendChild(
                    akcije
                );


                upitiLista.appendChild(
                    kartica
                );

            }
        );


    } catch (error) {

        console.error(
            "Greška pri učitavanju kontaktnih upita:",
            error
        );


        upitiLista.innerHTML = `
            <p>
                Došlo je do pogreške pri učitavanju upita.
            </p>
        `;

    }

}



// ========================================
// UČITAVANJE PROJEKATA KORISNIKA
// ========================================

async function ucitajProjekteKorisnika(
    userId,
    container
) {

    try {

        const projektiQuery =
            query(
                collection(db, "projekti"),
                where("userId", "==", userId)
            );


        const rezultat =
            await getDocs(projektiQuery);


        container.innerHTML = "";


        if (rezultat.empty) {

            container.innerHTML = `
                <p class="admin-nema-projekata">
                    Korisnik trenutno nema projekata.
                </p>
            `;

            return;
        }


        rezultat.forEach(
            function (dokument) {

                const projekt =
                    dokument.data();


                const datumProjekta =
                    formatirajDatumZaPrikaz(
                        projekt.datum
                    );


                const statusKlasa =
                    projekt.status === "Završeno"
                        ? "status-zavrseno"
                        : "status-u-obradi";


                const projektElement =
                    document.createElement("div");


                projektElement.classList.add(
                    "admin-projekt-kartica"
                );


                projektElement.innerHTML = `

                    <div class="admin-projekt-info">

                        <span>
                            ${escapeHtml(projekt.usluga)}
                        </span>

                        <h4>
                            ${escapeHtml(projekt.naziv)}
                        </h4>

                        <p>
                            ${escapeHtml(datumProjekta)}
                        </p>

                    </div>


                    <div class="admin-projekt-akcije">

                        <span
                            class="status-badge ${statusKlasa}"
                        >
                            ${escapeHtml(projekt.status)}
                        </span>


                        <button
                            type="button"
                            class="admin-uredi-projekt-btn"
                            data-project-id="${escapeHtml(dokument.id)}"
                            data-user-id="${escapeHtml(userId)}"
                        >
                            UREDI
                        </button>


                        <button
                            type="button"
                            class="admin-obrisi-projekt-btn"
                            data-project-id="${escapeHtml(dokument.id)}"
                            data-project-naziv="${escapeHtml(projekt.naziv)}"
                        >
                            OBRIŠI
                        </button>

                    </div>

                `;


                container.appendChild(
                    projektElement
                );

            }
        );


    } catch (error) {

        console.error(
            "Greška pri učitavanju projekata:",
            error
        );


        container.innerHTML =
            "<p>Greška pri učitavanju projekata.</p>";

    }

}



// ========================================
// UČITAVANJE KORISNIKA
// ========================================

async function ucitajKorisnike() {

    try {

        const rezultat =
            await getDocs(
                collection(db, "users")
            );


        korisniciLista.innerHTML = "";


        rezultat.forEach(
            function (dokument) {

                const korisnik =
                    dokument.data();


                const kartica =
                    document.createElement("article");


                kartica.classList.add(
                    "admin-korisnik-kartica"
                );


                kartica.dataset.search = normalizirajKorisnika(`${korisnik.ime || ''} ${korisnik.email || ''}`);
                kartica.dataset.role = korisnik.role || '';
                kartica.dataset.name = korisnik.ime || 'Bez imena';
                kartica.dataset.email = korisnik.email || '';
                kartica.innerHTML = `

                    <div class="admin-korisnik-zaglavlje">

                        <div>

                            <span>
                                ${
                                    korisnik.role === "admin"
                                        ? "Administrator"
                                        : "Klijent"
                                }
                            </span>

                            <h3>
                                ${
                                    escapeHtml(korisnik.ime || "Bez imena")
                                }
                            </h3>

                            <p>
                                ${escapeHtml(korisnik.email)}
                            </p>

                        </div>


                        ${
                            korisnik.role === "client"
                                ? `
                                    <button
                                        type="button"
                                        class="admin-dodaj-projekt-btn"
                                        data-user-id="${escapeHtml(dokument.id)}"
                                    >
                                        DODAJ PROJEKT
                                    </button>
                                `
                                : ""
                        }

                    </div>


                    ${
                        korisnik.role === "client"
                            ? `
                                <div class="admin-projekti-sekcija">

                                    <h4 class="admin-projekti-naslov">
                                        Projekti
                                    </h4>

                                    <div class="admin-projekti-lista">
                                        <p>
                                            Učitavanje projekata...
                                        </p>
                                    </div>

                                </div>
                            `
                            : ""
                    }

                `;


                korisniciLista.appendChild(
                    kartica
                );


                if (korisnik.role === "client") {

                    const projektiContainer =
                        kartica.querySelector(
                            ".admin-projekti-lista"
                        );


                    ucitajProjekteKorisnika(
                        dokument.id,
                        projektiContainer
                    );

                }

            }
        );


    filtrirajKorisnike();
    } catch (error) {

        document.querySelector("#korisnici-rezultat").textContent = "";
        console.error(
            "Greška pri učitavanju korisnika:",
            error
        );


        korisniciLista.innerHTML =
            "<p>Došlo je do pogreške pri učitavanju korisnika.</p>";

    }

}



// ========================================
// BRISANJE PROJEKTA
// ========================================

async function obrisiProjekt(projektId) {

    try {

        await deleteDoc(
            doc(
                db,
                "projekti",
                projektId
            )
        );


        console.log(
            "Projekt uspješno obrisan:",
            projektId
        );


        await ucitajKorisnike();
        await ucitajStatistiku();


    } catch (error) {

        console.error(
            "Greška pri brisanju projekta:",
            error
        );


        adminStatus.textContent =
            "Došlo je do pogreške pri brisanju projekta.";

    }

}



// ========================================
// KLIKOVI
// ========================================

document.addEventListener(
    "click",
    async function (event) {


        // ====================================
        // KONTAKTNI UPIT - PROČITANO
        // ====================================

        const procitanoUpitGumb =
            event.target.closest(
                ".admin-upit-procitano-btn"
            );


        if (procitanoUpitGumb) {

            try {

                const upitId =
                    procitanoUpitGumb.dataset.upitId;


                await updateDoc(
                    doc(
                        db,
                        "upiti",
                        upitId
                    ),
                    {
                        status: "Pročitano"
                    }
                );


                await ucitajUpite();


            } catch (error) {

                console.error(
                    "Greška pri promjeni statusa upita:",
                    error
                );

            }


            return;
        }



        // ====================================
        // KONTAKTNI UPIT - OBRIŠI
        // ====================================

        const obrisiUpitGumb =
            event.target.closest(
                ".admin-upit-obrisi-btn"
            );


        if (obrisiUpitGumb) {

            const upitId =
                obrisiUpitGumb.dataset.upitId;


            const potvrda =
                window.confirm(
                    "Želite li sigurno obrisati ovaj kontaktni upit?"
                );


            if (!potvrda) {
                return;
            }


            try {

                await deleteDoc(
                    doc(
                        db,
                        "upiti",
                        upitId
                    )
                );


                await ucitajUpite();


            } catch (error) {

                console.error(
                    "Greška pri brisanju upita:",
                    error
                );

            }


            return;
        }



        // ====================================
        // DODAJ PROJEKT
        // ====================================

        const dodajGumb =
            event.target.closest(
                ".admin-dodaj-projekt-btn"
            );


        if (dodajGumb) {

            noviProjektForma.reset();

            projektIdPolje.value = "";


            const userId =
                dodajGumb.dataset.userId;


            const korisnikKartica =
                dodajGumb.closest(
                    ".admin-korisnik-kartica"
                );


            const userIme =
                korisnikKartica
                    ?.querySelector("h3")
                    ?.textContent
                    ?.trim() || "Klijent";


            projektUserId.value =
                userId;


            odabraniKorisnikIme.textContent =
                userIme;


            projektModalNaslov.textContent =
                "Dodaj projekt";


            projektSubmitBtn.textContent =
                "Spremi projekt";


            projektFormaStatus.textContent =
                "";


            projektModal.hidden =
                false;


            return;
        }



        // ====================================
        // UREDI PROJEKT
        // ====================================

        const urediGumb =
            event.target.closest(
                ".admin-uredi-projekt-btn"
            );


        if (urediGumb) {

            try {

                const projektId =
                    urediGumb.dataset.projectId;


                const userId =
                    urediGumb.dataset.userId;


                const projektDokument =
                    await getDoc(
                        doc(
                            db,
                            "projekti",
                            projektId
                        )
                    );


                if (!projektDokument.exists()) {

                    adminStatus.textContent =
                        "Projekt više ne postoji.";

                    return;
                }


                const projekt =
                    projektDokument.data();


                projektIdPolje.value =
                    projektId;


                projektUserId.value =
                    userId;


                projektNaziv.value =
                    projekt.naziv || "";


                projektUsluga.value =
                    projekt.usluga || "";


                projektStatus.value =
                    projekt.status || "U obradi";

                projektDownloadUrl.value = projekt.downloadUrl || "";


                projektDatum.value =
                    formatirajDatumZaInput(
                        projekt.datum
                    );


                const korisnikKartica =
                    urediGumb.closest(
                        ".admin-korisnik-kartica"
                    );


                const userIme =
                    korisnikKartica
                        ?.querySelector("h3")
                        ?.textContent
                        ?.trim() || "Klijent";


                odabraniKorisnikIme.textContent =
                    userIme;


                projektModalNaslov.textContent =
                    "Uredi projekt";


                projektSubmitBtn.textContent =
                    "Spremi izmjene";


                projektFormaStatus.textContent =
                    "";


                projektModal.hidden =
                    false;


            } catch (error) {

                console.error(
                    "Greška pri učitavanju projekta:",
                    error
                );


                adminStatus.textContent =
                    "Došlo je do pogreške pri učitavanju projekta.";

            }


            return;
        }



        // ====================================
        // OBRIŠI PROJEKT
        // ====================================

        const obrisiGumb =
            event.target.closest(
                ".admin-obrisi-projekt-btn"
            );


        if (obrisiGumb) {

            const projektId =
                obrisiGumb.dataset.projectId;


            const projektNaziv =
                obrisiGumb.dataset.projectNaziv;


            const potvrda =
                window.confirm(
                    `Želite li sigurno obrisati projekt "${projektNaziv}"?`
                );


            if (!potvrda) {
                return;
            }


            await obrisiProjekt(
                projektId
            );


            return;
        }

    }
);



// ========================================
// ZATVARANJE MODALA
// ========================================

function zatvoriModalProjekta() {

    projektModal.hidden =
        true;


    projektFormaStatus.textContent =
        "";

}


zatvoriProjektModal.addEventListener(
    "click",
    zatvoriModalProjekta
);


projektModal.addEventListener(
    "click",
    function (event) {

        if (event.target === projektModal) {

            zatvoriModalProjekta();

        }

    }
);



// ========================================
// PROVJERA ADMINISTRATORSKOG RAČUNA
// ========================================

onAuthStateChanged(
    auth,
    async function (user) {


        if (!user) {

            window.location.href =
                "prijava.html";

            return;
        }


        try {

            const korisnikDokument =
                await getDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    )
                );


            if (!korisnikDokument.exists()) {

                window.location.href =
                    "moj-racun.html";

                return;
            }


            const korisnikPodaci =
                korisnikDokument.data();


            if (korisnikPodaci.role !== "admin") {

                window.location.href =
                    "moj-racun.html";

                return;
            }


            adminStatus.textContent =
                `Prijavljeni administrator: ${korisnikPodaci.ime}`;


            adminSadrzaj.hidden =
                false;


            // UČITAVANJE ADMIN PODATAKA

            await ucitajStatistiku();

            await ucitajUpite();

            await ucitajKorisnike();


        } catch (error) {

            console.error(
                "Greška pri provjeri administratorskog računa:",
                error
            );


            adminStatus.textContent =
                "Došlo je do pogreške pri provjeri administratorskog računa.";

        }

    }
);



// ========================================
// ODJAVA ADMINISTRATORA
// ========================================

adminOdjavaBtn.addEventListener(
    "click",
    async function () {

        try {

            await signOut(auth);


            window.location.href =
                "prijava.html";


        } catch (error) {

            console.error(
                "Greška pri odjavi:",
                error
            );


            adminStatus.textContent =
                "Došlo je do pogreške prilikom odjave.";

        }

    }
);



// ========================================
// DODAVANJE / UREĐIVANJE PROJEKTA
// ========================================

noviProjektForma.addEventListener(
    "submit",
    async function (event) {


        event.preventDefault();


        const projektId =
            projektIdPolje.value;


        const userId =
            projektUserId.value;


        const naziv =
            projektNaziv.value.trim();


        const usluga =
            projektUsluga.value;


        const status =
            projektStatus.value;


        const datumVrijednost =
            projektDatum.value;

        const downloadUrl = projektDownloadUrl.value.trim();
        if (downloadUrl) {
            try {
                if (!safeDownloadUrl(downloadUrl)) throw new Error("URL");
            } catch {
                projektFormaStatus.textContent = "Unesite ispravnu poveznicu koja počinje s https:// ili http://.";
                projektDownloadUrl.focus();
                return;
            }
        }



        if (!userId) {

            projektFormaStatus.textContent =
                "Nije odabran korisnik.";

            return;
        }


        if (
            !naziv ||
            !usluga ||
            !status ||
            !datumVrijednost
        ) {

            projektFormaStatus.textContent =
                "Molimo ispunite sva polja.";

            return;
        }


        try {

            projektFormaStatus.textContent =
                "Spremanje projekta...";


            const datum =
                new Date(
                    `${datumVrijednost}T12:00:00`
                );


            const podaciProjekta = {

                userId: userId,
                naziv: naziv,
                usluga: usluga,
                status: status,
                datum: datum,
                downloadUrl: downloadUrl

            };


            if (projektId) {

                await updateDoc(
                    doc(
                        db,
                        "projekti",
                        projektId
                    ),
                    podaciProjekta
                );


                projektFormaStatus.textContent =
                    "Projekt je uspješno ažuriran.";


            } else {

                await addDoc(
                    collection(
                        db,
                        "projekti"
                    ),
                    podaciProjekta
                );


                projektFormaStatus.textContent =
                    "Projekt je uspješno spremljen.";

            }


            await ucitajKorisnike();

            await ucitajStatistiku();


            noviProjektForma.reset();

            projektIdPolje.value =
                "";


            setTimeout(
                function () {

                    zatvoriModalProjekta();

                },
                800
            );


        } catch (error) {

            console.error(
                "Greška pri spremanju projekta:",
                error
            );


            projektFormaStatus.textContent =
                "Došlo je do pogreške pri spremanju projekta.";

        }

    }
);
// Search and role filters operate on the loaded user cards without database writes.
function normalizirajKorisnika(value) {
    return String(value).toLocaleLowerCase('hr').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
}
function filtrirajKorisnike() {
    const terms = normalizirajKorisnika(document.querySelector('#korisnici-trazi').value).trim().split(/\s+/).filter(Boolean);
    const role = document.querySelector('#korisnici-uloga').value;
    const cards = korisniciLista.querySelectorAll('.admin-korisnik-kartica');
    const [field, direction] = document.querySelector('#korisnici-sort').value.split('-');
    const comparer = new Intl.Collator('hr', { sensitivity: 'base', numeric: true });
    [...cards].sort((a, b) => comparer.compare(a.dataset[field], b.dataset[field]) * (direction === 'desc' ? -1 : 1)).forEach(card => korisniciLista.appendChild(card));
    let count = 0;
    cards.forEach(card => {
        const match = (role === 'svi' || card.dataset.role === role) && terms.every(term => card.dataset.search.includes(term));
        card.hidden = !match;
        if (match) count++;
    });
    document.querySelector('#korisnici-rezultat').textContent = cards.length === 0 ? 'Nema registriranih korisnika.' : count === 0 ? 'Nema korisnika koji odgovaraju odabranim filtrima.' : `Prikazano: ${count} od ${cards.length} korisnika`;
}
document.querySelector('#korisnici-trazi').addEventListener('input', filtrirajKorisnike);
document.querySelector('#korisnici-uloga').addEventListener('change', filtrirajKorisnike);
document.querySelector('#korisnici-sort').addEventListener('change', filtrirajKorisnike);
document.querySelector('#korisnici-reset').addEventListener('click', () => {
    document.querySelector('#korisnici-trazi').value = '';
    document.querySelector('#korisnici-uloga').value = 'svi';
    document.querySelector('#korisnici-sort').value = 'name-asc';
    filtrirajKorisnike();
    document.querySelector('#korisnici-trazi').focus();
});
