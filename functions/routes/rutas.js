const express = require("express"); // Importar express
const router = express.Router();
const nodemailer = require("nodemailer");
const { body, param, validationResult } = require("express-validator");
const initializeApp = require('firebase/app');
const firebaseElements = require('firebase/firestore/lite');
const configuracion = require('./configuracion');
const { firestore } = require("firebase-admin");
const numeral = require('numeral')

const firebaseApp = initializeApp.initializeApp(configuracion);
const db = firebaseElements.getFirestore(firebaseApp);

router.get("/miembros",
  async (req, res) => {
    const usuariosRef = firebaseElements.collection(db, 'usuarios');
    const usuariosSnapshot = await firebaseElements.getDocs(usuariosRef);
    res.status = 200;

    res.send(usuariosSnapshot.docs.map((doc) => doc.data()));
  }
);

router.get("/apartados",
  async (req,res) => {
    
    const refCasas = firebaseElements.collectionGroup(db,'apartado');
    var datas = [];
    await firebaseElements.getDocs(refCasas).then(async (elements) => {
      
      for (let i = 0; i < elements.docs.length; i++) {
        const element = elements.docs[i];
        var data = element.data();
        let usuario = firebaseElements.doc(db, 'usuarios', data["uid"]);
        let infoUsuario = await firebaseElements.getDoc(usuario);
        data["infoUsuario"] = infoUsuario.data();
        data["fechaInicioFormato"] = new Date(data['fechaInicio']).toLocaleDateString();
        data["fechaFinalFormato"] = new Date(data['fechaFinal']).toLocaleDateString();
        data["precioFormato"] = numeral(data['precio']).format('0,0.00');
        data["idDocumento"] = element.id;
        datas.push(data);
      }
    });
    res.send(datas);
  }
);

router.get("/masApartados",
  async (req, res) => {
    var datas = [];
    const refApartados = firebaseElements.collectionGroup(db, 'apartado');
    await firebaseElements.getDocs(refApartados).then((elements) => {
      for (let i = 0; i < elements.docs.length; i++) {
        const element = elements.docs[i];
        var data = element.data();
        var result = datas.findIndex(obj => {
          return obj.idCasa === data["idCasa"];
        });
        if(result!=-1){
          datas[result].cant += 1;
        }else{
          datas.push({
            idCasa: data["idCasa"],
            cant: 1
          });
        }
      }
    });
    res.send(datas);
  }
);

router.get("/generos",
  async (req, res) => {
    var datas = [];
    const refUsuarios = firebaseElements.collectionGroup(db, 'usuarios');
    await firebaseElements.getDocs(refUsuarios).then((elements) => {
      for (let i = 0; i < elements.docs.length; i++) {
        const element = elements.docs[i];
        var data = element.data();
        var result = datas.findIndex(obj => {
          return obj.genero === data["gender"];
        });
        if(result!=-1){
          datas[result].cant += 1;
        }else{
          datas.push({
            genero: data["gender"],
            cant: 1
          });
        }
      }
    });
    res.send(datas);
  }
);

router.post(
  "/reserva",
  [
    body("casa").not().isEmpty(),
    body("usr").not().isEmpty(),
    body("fechaInicio").not().isEmpty(),
    body("fechaFinal").not().isEmpty()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ success: false, err: JSON.stringify(errors) });
      return;
    }
    let body = req.body;
    sendMail(body);
    res.json({ success: true });
  }
);


router.post(
  "/contacto",
  [
    body("desarrollo").not().isEmpty(),
    body("usr").not().isEmpty()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ success: false, err: JSON.stringify(errors) });
      return;
    }
    let body = req.body;
    sendMail2(body);
    res.json({ success: true });
  }
);
async function sendMail(data) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();
  
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com", // hostname
        secureConnection: false, // use SSL
        port: 587, // port for secure SMTP
        auth: {
            user: "al289539@edu.uaa.mx",
            pass: "Pakwar10!"
        }
    });
  
    // send mail with defined transport object
    /*let info = await transporter.sendMail({
      from: '"AirBnV" <al289539@edu.uaa.mx>', // sender address
      to: data.usr.email, // list of receivers
      subject: "Reserve de casa en AirBnV", // Subject line
      text: "Gracias por su preferencia", // plain text body
      html: `
            <h2>Se ha guardado exitosamente su registro ${data.usr.displayName}</h2>
            <br>
            <b><span>su reservacion de ${data.casa.nombre}, por el precio de ${data.casa.precio}</span></b>
            <br>
            <b><span>entre los días ${data.fechaInicio  } y ${data.fechaFinal} </b>
            
            `, // html body
    });*/

}

async function sendMail2(data) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com", // hostname
      secureConnection: false, // use SSL
      port: 587, // port for secure SMTP
      auth: {
          user: "al289539@edu.uaa.mx",
          pass: "Pakwar10!"
      }
  });

  // send mail with defined transport object
  /*let info = await transporter.sendMail({
    from: '"AirBnV" <al289539@edu.uaa.mx>', // sender address
    to: data.usr.email, // list of receivers
    subject: "Gracias por ponerse en contacto con nosotros", // Subject line
    text: "Gracias por su preferencia", // plain text body
    html: `
          <h2>Se recibió su mensaje, en la brevedad nos pondremos en contacto con usted</h2>
          <br>
          <b>${data.desarrollo}</span></b>
          <br>
          
          `, // html body
  });*/

}

router.get("/inversiones", (req, res) => {
  res.send({
    title: "Invercionistas",
    active: true,
    members: [
      {
        name: "Elon Musk",
        age: 55,
        investment: 420000000,
        happiness: "¡Estoy muy feliz de invertir en esta oportunidad!",
      },
      {
        name: "Warren Buffett",
        age: 91,
        investment: 800000000,
        happiness: "Invertir siempre me llena de alegría y emoción.",
      },
      {
        name: "Jeff Bezos",
        age: 58,
        investment: 650000000,
        happiness: "Es un honor formar parte de esta inversión exitosa.",
      },
      {
        name: "Sara Blakely",
        age: 50,
        investment: 30000000,
        happiness: "Estoy encantada de apoyar este proyecto innovador.",
      },
      {
        name: "Carlos Slim",
        age: 81,
        investment: 550000000,
        happiness:
          "Mi inversión es un reflejo de mi confianza en el potencial de esta empresa.",
      },
      {
        name: "Cathie Wood",
        age: 66,
        investment: 150000000,
        happiness:
          "Invertir en el futuro siempre me llena de felicidad y entusiasmo.",
      },
    ],
  });
});

module.exports = router;
