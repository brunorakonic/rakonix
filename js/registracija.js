import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const registracijaForma = document.querySelector("#registracija-forma");

const imePolje = document.querySelector("#reg-ime");
const emailPolje = document.querySelector("#reg-email");
const lozinkaPolje = document.querySelector("#reg-lozinka");
const ponovljenaLozinkaPolje = document.querySelector("#reg-lozinka-ponovno");

const registracijaStatus = document.querySelector("#registracija-status");


registracijaForma.addEventListener("submit", async function (event) {

    event.preventDefault();

    const ime = imePolje.value.trim();
    const email = emailPolje.value.trim();
    const lozinka = lozinkaPolje.value;
    const ponovljenaLozinka = ponovljenaLozinkaPolje.value;


    if (lozinka !== ponovljenaLozinka) {
        registracijaStatus.textContent = "Lozinke se ne podudaraju.";
        return;
    }


    try {

        const korisnickiPodaci = await createUserWithEmailAndPassword(
            auth,
            email,
            lozinka
        );


        await updateProfile(korisnickiPodaci.user, {
            displayName: ime
        });

        await setDoc(
    doc(db, "users", korisnickiPodaci.user.uid),
    {
        ime: ime,
        email: email,
        role: "client",
        datumRegistracije: serverTimestamp()
    }
);


        registracijaStatus.textContent =
            "Registracija je uspješna!";


        registracijaForma.reset();


    } catch (error) {

        console.error(error);

        registracijaStatus.textContent =
            "Došlo je do pogreške prilikom registracije.";
    }

});