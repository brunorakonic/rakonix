import { escapeHtml, safeDownloadUrl } from './safe-content.js';
import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const korisnikIme = document.querySelector("#korisnik-ime");
const korisnikEmail = document.querySelector("#korisnik-email");
const racunStatus = document.querySelector("#racun-status");
const projektiLista = document.querySelector("#projekti-lista");
const odjavaHeaderBtn = document.querySelector("#odjava-header-btn");
const adminLink = document.querySelector("#admin-link");

async function ucitajProjekte(userId) {

    try {

        const projektiQuery = query(
            collection(db, "projekti"),
            where("userId", "==", userId)
        );

        const rezultat = await getDocs(projektiQuery);

        projektiLista.innerHTML = "";

        if (rezultat.empty) {

            projektiLista.innerHTML =
                "<p>Trenutno nemate aktivnih projekata.</p>";

            return;
        }


        rezultat.forEach(function (dokument) {

            const projekt = dokument.data();

            const kartica = document.createElement("article");

            kartica.classList.add("projekt-kartica");


            let datumProjekta = "";

            if (projekt.datum) {

                datumProjekta =
                    projekt.datum
                        .toDate()
                        .toLocaleDateString("hr-HR");

            }


const statusKlasa =
    projekt.status === "Završeno"
        ? "status-zavrseno"
        : "status-u-obradi";

const downloadUrl = safeDownloadUrl(projekt.downloadUrl);
kartica.innerHTML = `
    <div class="projekt-zaglavlje">

        <div>
            <span>${escapeHtml(projekt.usluga)}</span>
            <h3>${escapeHtml(projekt.naziv)}</h3>
        </div>

        <span class="status-badge ${statusKlasa}">
            ${escapeHtml(projekt.status)}
        </span>

    </div>

    <p>
        <strong>Datum:</strong>
        ${escapeHtml(datumProjekta)}
    </p>

    ${
        projekt.status === "Završeno" && downloadUrl
            ? `<a
                href="${escapeHtml(downloadUrl)}"
                target="_blank" rel="noopener noreferrer"
                class="projekt-download-btn"
              >
                PREUZMI DATOTEKE
              </a>`
            : `<p class="datoteke-status">
                Datoteke još nisu dostupne.
               </p>`
    }
`;


            projektiLista.appendChild(kartica);

        });


    } catch (error) {

        console.error(error);

        projektiLista.innerHTML =
            "<p>Došlo je do pogreške pri učitavanju projekata.</p>";

    }

}


onAuthStateChanged(auth, async function (user) {

    if (user) {

        korisnikIme.textContent =
            user.displayName || "Nije navedeno";

        korisnikEmail.textContent =
            user.email;


        ucitajProjekte(user.uid);


        const korisnikDokument =
            await getDoc(
                doc(db, "users", user.uid)
            );


        if (korisnikDokument.exists()) {

            const korisnikPodaci =
                korisnikDokument.data();


            if (korisnikPodaci.role === "admin") {

                adminLink.hidden = false;

            }

        }

    } else {

        window.location.href =
            "prijava.html";

    }

});


async function odjaviKorisnika() {

    try {

        await signOut(auth);

        window.location.href = "prijava.html";

    } catch (error) {

        console.error(error);

        racunStatus.textContent =
            "Došlo je do pogreške prilikom odjave.";

    }

}


odjavaHeaderBtn.addEventListener("click", odjaviKorisnika);