import transporter from "../config/transporter.config.js";

const sendEmail = async (options) => {
    try {
        let response = await transporter.sendMail(options)
        console.log(response);

    }
    catch (error) {
        //Para poder trackear el error mejor y poder arreglarlo
        console.error('Error al enviar el mail', error);
        //Para que la funcion que invoquea esta funcion tambie le salte el error
        throw error
    }
}

export default sendEmail