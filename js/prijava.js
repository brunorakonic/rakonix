import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const prijavaForma = document.querySelector("#prijava-forma");

const emailPolje = document.querySelector("#login-email");
const lozinkaPolje = document.querySelector("#login-lozinka");

const prijavaStatus = document.querySelector("#prijava-status");
const zaboravljenaLozinkaBtn =
    document.querySelector("#zaboravljena-lozinka-btn");


prijavaForma.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = emailPolje.value.trim();
    const lozinka = lozinkaPolje.value;


    try {

        const korisnickiPodaci = await signInWithEmailAndPassword(
            auth,
            email,
            lozinka
        );

        console.log("Prijavljeni korisnik:", korisnickiPodaci.user);

        prijavaStatus.textContent = "Prijava je uspješna!";

        window.location.href = "moj-racun.html";


    } catch (error) {

        console.error(error);

        prijavaStatus.textContent =
            "Email ili lozinka nisu ispravni.";
    }

});

zaboravljenaLozinkaBtn.addEventListener("click", async function () {

    const email = emailPolje.value.trim();


    if (email === "") {

        prijavaStatus.textContent =
            "Prvo unesite email adresu svog korisničkog računa.";

        emailPolje.focus();

        return;
    }


    try {

        await sendPasswordResetEmail(
            auth,
            email
        );


        prijavaStatus.textContent =
            "Email za promjenu lozinke je poslan. Provjerite svoju pristiglu poštu.";


    } catch (error) {

        console.error(
            "Greška pri slanju emaila za promjenu lozinke:",
            error
        );


        prijavaStatus.textContent =
            "Nije moguće poslati email za promjenu lozinke.";

    }

});