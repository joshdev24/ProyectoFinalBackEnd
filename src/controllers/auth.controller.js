import ENVIROMENT from "../config/enviroment.config.js"
import User from "../models/user.model.js"
import ResponseBuilder from "../utils/builders/responseBuilder.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { sendEmail } from "../utils/mail.util.js"
import UserRepository from "../repositories/user.repository.js"
import e from "cors"




export const registerUserController = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validaciones
        if (!email || !password || !name) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Bad request')
                .setPayload({ detail: 'Faltan campos obligatorios' })
                .build();
            return res.status(400).json(response);
        }

        // Verificar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Bad request')
                .setPayload({ detail: 'El formato del email no es válido' })
                .build();
            return res.status(400).json(response);
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(409)
                .setMessage('Conflict')
                .setPayload({ detail: 'El usuario ya está registrado' })
                .build();
            return res.status(409).json(response);
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generar token de verificación
        const verificationToken = jwt.sign(
            { email },
            ENVIROMENT.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const urlVerification = `http://localhost:${process.env.PORT}/api/auth/verify/${verificationToken}`;

        // Enviar correo de verificación
        await sendEmail({
            to: email,
            subject: 'Valida tu correo electrónico',
            html: `
                <h1>Verificación de correo electrónico</h1>
                <p>Haz clic en el botón de abajo para verificar tu correo:</p>
                <a 
                    style="background-color: black; color: white; padding: 10px; border-radius: 5px; text-decoration: none;"
                    href="${urlVerification}"
                >Verificar correo</a>
            `
        });
        

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken: verificationToken,
            emailVerified: false
        })

        //Metodo save nos permite guardar el objeto en la DB
        await newUser.save()

        const response = new ResponseBuilder()
        .setOk(true)
        .setStatus(200)
        .setMessage('Created')
        .setPayload({})
        .build()
        return res.status(201).json(response)
    }
    catch(error){
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(500)
        .setMessage('Internal server error')
        .setPayload(
            {
                detail: error.message
                
            }
        )
        .build()
        return res.status(500).json(response)
    }

}



export const verifyMailValidationTokenController = async (req, res) => {
    try{
        const {verification_token} = req.params
        if(!verification_token){
            const response = new ResponseBuilder().setOk(false)
            .setStatus(400)
            .setPayload({
                'detail': 'Falta enviar token'
            })
            .build()
            return res.json(response)
        }
        //Verificamos la firma del token, debe ser la misma que mi clave secreta, eso asegura que este token sea emitido por mi servidor
        //Si fallara la lectura/verificacion/expiracion hara un throw
        //La constante decoded tiene el payload de mi token
        const decoded = jwt.verify(verification_token, ENVIROMENT.JWT_SECRET)

        //Busco al usuario en mi DB por email
        const user = await User.findOne({email: decoded.email})
        if(!user){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(404)
            .setMessage('Not found')
            .setPayload({
                'detail': 'Usuario no encontrado'
            })
            .build()
            return res.json(response)       
            
        }
        if(user.emailVerified){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setMessage('Bad request')
            .setPayload({
                'detail': 'El usuario ya ha verificado su correo'
            })
            .build()
            return res.json(response)
            
        }

        user.emailVerified = true
       

        await user.save()
        const response = new ResponseBuilder()
        .setOk(true)
        .setMessage('Email verificado con exito')
        .setStatus(200)
        .setPayload({
            message: "Usuario validado"
        })
        .build()
        res.json(response)
    }   
    catch(error){
        console.error(error)
    }
}

export const loginController = async (req, res) => {
    try{
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(404)
            .setMessage('Usuario no encontrado')
            .setPayload({
                detail: 'El email no esta registrado'
            })
            .build()
            return res.json(response)
        }
        if(!user.emailVerified){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(403)
            .setMessage('Email no verificado')
            .setPayload(
                {
                    detail: 'Por favor, verifica tu correo electronico antes de iniciar sesion'
                }
            )
            .build()
            return res.json(response)
        }

        const isValidPassword = await bcrypt.compare(password, user.password)
        if(!isValidPassword){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(401)
            .setMessage('Credenciales incorrectas')
            .setPayload({
                detail: 'Contraseña incorrecta'
            })
            .build()
            return res.json(response)
        }
        const token = jwt.sign(
            {
                email: user.email, 
                id: user._id, 
                role: user.role
            }, 
            ENVIROMENT.JWT_SECRET, 
            { expiresIn: '1d'}
        )
        const response = new ResponseBuilder()
        .setOk(true)
        .setStatus(200)
        .setMessage('Logueado')
        .setPayload({
            token,
            user: {
                id:user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
        .build()
        res.json(response)
    }
    catch(error){
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(500)
        .setMessage('Internal server error')
        .setPayload({
            detail: error.message
        })
        .build()
        res.json(response)
    }
    
}


export const forgotPasswordController = async (req, res) => {
    try{
        const {email} = req.body
        //Validamos que llegue el email
        console.log(email)
        const user = await UserRepository.obtenerPorEmail(email)
        if(!user){
            //Logica de usuario no encontrado
        }
        const resetToken = jwt.sign({email: user.email}, ENVIROMENT.JWT_SECRET, {
            expiresIn: '1h'
        })
        //TODO crear una url_front en el ENVIROMENT
        const resetUrl = `${ENVIROMENT.URL_FRONT}/reset-password/${resetToken}`
        sendEmail({
            to: user.email,
            subject: 'Restablecer contraseña',
            html: `
                <div>
                    <h1>Has solicitado restablecer tu contraseña</h1>
                    <p>Has click en el enlace de abajo para restablecer tu contraseña</p>
                    <a href='${resetUrl}'>Restablecer</a>
                </div>
            `
        })
        const response = new ResponseBuilder()
        response
        .setOk(true)
        .setStatus(200)
        .setMessage('Se envio el correo')
        .setPayload({
            detail: 'Se envio un correo electronico con las instrucciones para restablecer la contraseña.'
        })
        .build()
        return res.json(response)
    }
    catch(error){
        //Manajer logica de error
    }
}


export const resetTokenController = async (req, res) => {
    try {
        const { password } = req.body
        if (!password) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(500)
                .setMessage("Bad Request")
                .setPayload({
                    detail: "Intente usar una contraseña que no ha usado antes."
                })
                .build()
            return res.json(response)
        }
        const { reset_token } = req.params
        if (!reset_token) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Token Incorrecto')
                .setPayload({
                    detail: 'El reset_token expiro o no es valido'
                })
                .build()
            return res.json(response)
        }
        const decoded = jwt.verify(reset_token, ENVIROMENT.JWT_SECRET)
        console.log(decoded);


        if (!decoded) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(500)
                .setMessage("Accion Invalida")
                .setPayload({
                    detail: "Error al leer el  Token de verificacion"
                })
                .build()
            return res.json(response)
        }


        const { email } = decoded
        const user = await UserRepository.obtenerPorEmail(email)
        if (!user) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(404)
                .setMessage('Usuario no encontrado')
                .setPayload({
                    detail: 'El email no parece estar registrado'
                })
                .build()
            return res.json(response)
        }

        const encriptedPassword = await bcrypt.hash(password, 10);
        const comparacion = await bcrypt.compare(password, encriptedPassword)
        user.password = encriptedPassword
        await user.save()

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('Operacion Exitosa')
            .setPayload({
                detail: 'Su contraseña a sido reestablecida'
            })
            .build()
        res.json(response)
        await sendEmail({
            to: email,
            subject: "Solicitud de restablecimiento de contraseña",
            html: "<p>Su contraseña ha sido restablecida con éxito.</p>"
        });

    } 
    
    catch (error) {
        console.error('Error en el proceso de restablecimiento:', error); //
        const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(500)
            .setMessage('Error en el proceso de restablecimiento')
            .setPayload({
                detail: 'Hubo un problema al restablecer su contraseña. Por favor, inténtelo nuevamente.'
            })
            .build();
        res.json(response);
        await sendEmail({
            to: email,
            subject: "Error en el restablecimiento de contraseña",
            html: `
                <div>
                    <h1>Error al intentar restablecer su contraseña</h1>
                    <p>Por favor, intente nuevamente.</p>
                </div>
            `
        });
    }
}


