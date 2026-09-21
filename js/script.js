import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const accountLink = document.querySelector("#account-link");

if (accountLink) {

    onAuthStateChanged(auth, function (user) {
        
         console.log("Korisnik na glavnoj stranici:", user);


        if (user) {

            accountLink.textContent = "Moj račun";
            accountLink.href = "moj-racun.html";

        } else {

            accountLink.textContent = "Prijavi se";
            accountLink.href = "prijava.html";

        }

    });

}


// ========================================
// HAMBURGER MENI
// ========================================

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#glavna-navigacija");
const navLinks = document.querySelectorAll("#glavna-navigacija a");

if (menuToggle && mainNav) {

    // Zatvara mobilni meni i vraća početne ARIA atribute
    function zatvoriMeni() {
        mainNav.classList.remove("is-open");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Otvori navigaciju"
        );
    }

    // Otvaranje i zatvaranje klikom na hamburger
    menuToggle.addEventListener("click", function () {
        const menuJeOtvoren =
            mainNav.classList.toggle("is-open");

        menuToggle.setAttribute(
            "aria-expanded",
            menuJeOtvoren
        );

        if (menuJeOtvoren) {
            menuToggle.setAttribute(
                "aria-label",
                "Zatvori navigaciju"
            );
        } else {
            menuToggle.setAttribute(
                "aria-label",
                "Otvori navigaciju"
            );
        }
    });

    // Zatvaranje nakon klika na stavku navigacije
    navLinks.forEach(function (link) {
        link.addEventListener("click", zatvoriMeni);
    });

    // Zatvaranje klikom izvan hamburgera i navigacije
    document.addEventListener("click", function (event) {
        const klikNaHamburger =
            menuToggle.contains(event.target);

        const klikUnutarNavigacije =
            mainNav.contains(event.target);

        if (!klikNaHamburger && !klikUnutarNavigacije) {
            zatvoriMeni();
        }
    });

    // Zatvaranje pritiskom tipke Escape
    document.addEventListener("keydown", function (event) {
        if (
            event.key === "Escape" &&
            mainNav.classList.contains("is-open")
        ) {
            zatvoriMeni();

            // Vraća fokus na hamburger gumb
            menuToggle.focus();
        }
    });
}

// ========================================
// KONTAKTNA FORMA
// ========================================

const kontaktForma =
    document.querySelector("#kontakt-forma");


if (kontaktForma) {

    const imePolje =
        document.querySelector("#ime");

    const emailPolje =
        document.querySelector("#email");

    const uslugaPolje =
        document.querySelector("#usluga");

    const porukaPolje =
        document.querySelector("#poruka");

    const emailGreska =
        document.querySelector("#email-greska");

    const statusForme =
        document.querySelector("#status-forme");

    const posaljiBtn =
        kontaktForma.querySelector(
            'button[type="submit"]'
        );


    // ====================================
    // PRIKAZ GREŠKE EMAILA
    // ====================================

    function prikaziEmailGresku(poruka) {

        emailGreska.textContent =
            poruka;


        emailPolje.classList.add(
            "polje-greska"
        );


        emailPolje.classList.remove(
            "polje-ispravno"
        );


        emailPolje.setAttribute(
            "aria-invalid",
            "true"
        );

    }


    // ====================================
    // UKLANJANJE GREŠKE EMAILA
    // ====================================

    function ukloniEmailGresku() {

        emailGreska.textContent =
            "";


        emailPolje.classList.remove(
            "polje-greska"
        );


        emailPolje.classList.add(
            "polje-ispravno"
        );


        emailPolje.setAttribute(
            "aria-invalid",
            "false"
        );

    }


    // ====================================
    // PROVJERA EMAILA
    // ====================================

    function provjeriEmail() {

        const emailVrijednost =
            emailPolje.value.trim();


        if (emailVrijednost === "") {

            prikaziEmailGresku(
                "Molimo unesite svoju email adresu."
            );

            return false;
        }


        if (
            emailPolje.validity.typeMismatch
        ) {

            prikaziEmailGresku(
                "Unesite ispravnu email adresu, primjerice ime@primjer.hr."
            );

            return false;
        }


        ukloniEmailGresku();

        return true;

    }


    // ====================================
    // EMAIL EVENTI
    // ====================================

    emailPolje.addEventListener(
        "blur",
        provjeriEmail
    );


    emailPolje.addEventListener(
        "input",
        function () {

            if (
                emailPolje.classList.contains(
                    "polje-greska"
                )
            ) {

                provjeriEmail();

            }

        }
    );


    // ====================================
    // SLANJE KONTAKTNOG UPITA
    // ====================================

    kontaktForma.addEventListener(
        "submit",
        async function (event) {


            event.preventDefault();


            const ime =
                imePolje.value.trim();

            const email =
                emailPolje.value.trim();

            const usluga =
                uslugaPolje.value;

            const poruka =
                porukaPolje.value.trim();


            // PROVJERA EMAILA

            const emailJeIspravan =
                provjeriEmail();


            if (!emailJeIspravan) {

                emailPolje.focus();


                if (statusForme) {

                    statusForme.textContent =
                        "Provjerite označeno polje.";

                }


                return;
            }


            // PROVJERA OSTALIH POLJA

            if (ime === "") {

                statusForme.textContent =
                    "Molimo unesite ime i prezime.";

                imePolje.focus();

                return;
            }


            if (usluga === "") {

                statusForme.textContent =
                    "Molimo odaberite uslugu.";

                uslugaPolje.focus();

                return;
            }


            if (poruka === "") {

                statusForme.textContent =
                    "Molimo unesite poruku.";

                porukaPolje.focus();

                return;
            }


            try {

                statusForme.textContent =
                    "Slanje upita...";


                posaljiBtn.disabled =
                    true;


                // SPREMANJE U FIRESTORE

                await addDoc(
                    collection(
                        db,
                        "upiti"
                    ),
                    {
                        ime: ime,
                        email: email,
                        usluga: usluga,
                        poruka: poruka,
                        status: "Novi",
                        datum: serverTimestamp()
                    }
                );


                statusForme.textContent =
                    "Upit je uspješno poslan. Javit ćemo vam se u najkraćem roku.";


                // ČIŠĆENJE FORME

                kontaktForma.reset();


                emailPolje.classList.remove(
                    "polje-ispravno",
                    "polje-greska"
                );


                emailPolje.removeAttribute(
                    "aria-invalid"
                );


                emailGreska.textContent =
                    "";


            } catch (error) {

                console.error(
                    "Greška pri slanju upita:",
                    error
                );


                statusForme.textContent =
                    "Došlo je do pogreške pri slanju upita. Pokušajte ponovno.";


            } finally {

                posaljiBtn.disabled =
                    false;

            }

        }
    );

}


console.log("POČINJE KOD ZA ANIMACIJU");

const elementiZaAnimaciju = document.querySelectorAll(
    "main .section-content"
);

console.log(
    "Pronađeno elemenata:",
    elementiZaAnimaciju.length
);

elementiZaAnimaciju.forEach(function (element) {
    element.classList.add("reveal");
});

const promatracSekcija = new IntersectionObserver(
    function (unosi, promatrac) {
        unosi.forEach(function (unos) {
            if (unos.isIntersecting) {
                unos.target.classList.add("is-visible");
                promatrac.unobserve(unos.target);
            }
        });
    },
    {
        threshold: 0.15
    }
);

elementiZaAnimaciju.forEach(function (element) {
    promatracSekcija.observe(element);
});

// ========================================
// FAQ HARMONIKA
// ========================================

const faqPitanja = document.querySelectorAll(".faq-pitanje");

faqPitanja.forEach(function (pitanje) {
    pitanje.addEventListener("click", function () {
        const stavka = pitanje.closest(".faq-stavka");
        const odgovor = stavka.querySelector(".faq-odgovor");

        const pitanjeJeOtvoreno =
            pitanje.getAttribute("aria-expanded") === "true";

        // Zatvara sva prethodno otvorena pitanja
        faqPitanja.forEach(function (drugoPitanje) {
            const drugaStavka =
                drugoPitanje.closest(".faq-stavka");

            const drugiOdgovor =
                drugaStavka.querySelector(".faq-odgovor");

            drugoPitanje.setAttribute(
                "aria-expanded",
                "false"
            );

            drugaStavka.classList.remove("is-open");
            drugiOdgovor.hidden = true;
        });

        // Otvara kliknuto pitanje ako prethodno nije bilo otvoreno
        if (!pitanjeJeOtvoreno) {
            pitanje.setAttribute(
                "aria-expanded",
                "true"
            );

            stavka.classList.add("is-open");
            odgovor.hidden = false;
        }
    });
});

// ========================================
// AUDIO CANVAS
// ========================================

const canvas = document.querySelector("#audio-visualizer");
const audioCanvas = document.querySelector("#rakonix-audio");

if (canvas && audioCanvas) {

    const ctx = canvas.getContext("2d");

    canvas.width = 600;
    canvas.height = 180;

    let zadnjeVrijeme = 0;
    const brzina = 150;

    function drawVisualizer(vrijeme) {

        if (vrijeme - zadnjeVrijeme < brzina) {
            requestAnimationFrame(drawVisualizer);
            return;
        }

        zadnjeVrijeme = vrijeme;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const brojStupaca = 32;
        const sirinaStupca = 10;
        const razmak = 8;

        for (let i = 0; i < brojStupaca; i++) {

            let visina;

            if (audioCanvas.paused) {
                visina = 20;
            } else {
                visina = Math.random() * 110 + 20;
            }

            const x = i * (sirinaStupca + razmak) + 20;
            const y = (canvas.height - visina) / 2;

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x, y, sirinaStupca, visina);
        }

        requestAnimationFrame(drawVisualizer);
    }

    requestAnimationFrame(drawVisualizer);
}

