import React, { useState } from 'react'
import { View } from 'react-native'
import { Button, Dialog, Portal, Text, TextInput } from 'react-native-paper'
import { styles } from '../theme/styles';
import { auth } from '../config/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

interface FormLogin {
    email: string;
    password: string;
}

interface DialogState {
    visible: boolean;
    title: string;
    message: string;
    type: 'error' | 'success';
}

export const LoginScreen = () => {
    const navigation = useNavigation();
    const [formLogin, setFormLogin] = useState<FormLogin>({
        email:'',
        password: ''
    });

    // Estado dinámico para el diálogo
    const [dialogState, setDialogState] = useState<DialogState>({
        visible: false,
        title: '',
        message: '',
        type: 'error'
    });

    // Estado para mostrar loading
    const [isLoading, setIsLoading] = useState(false);

    const handleSetValues = (key:string, value:string) => {
        setFormLogin({... formLogin, [key]:value});
    }

    const showDialog = (title: string, message: string, type: 'error' | 'success' = 'error') => {
        setDialogState({
            visible: true,
            title,
            message,
            type
        });
    };

    const hideDialog = () => {
        setDialogState(prev => ({ ...prev, visible: false }));
    };

    const handleLoginUser = async () => {
        // Validación de campos vacíos
        if (!formLogin.email || !formLogin.password) {
            showDialog('Error de Validación', 'Por favor, completa todos los campos', 'error');
            return;
        }

        // Validación de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formLogin.email)) {
            showDialog('Error de Validación', 'Por favor, ingresa un email válido', 'error');
            return;
        }

        // Activar loading
        setIsLoading(true);

        try {
            // Iniciar sesión con Firebase Auth
            const userCredential = await signInWithEmailAndPassword(
                auth,
                formLogin.email,
                formLogin.password
            );

            // Usuario logueado exitosamente
            const user = userCredential.user;
            console.log('Usuario logueado:', user.email);
            
            showDialog(
                '¡Inicio de Sesión Exitoso!', 
                `Bienvenido de vuelta ${formLogin.email}. Has iniciado sesión correctamente.`, 
                'success'
            );
            
            // Limpiar el formulario después del login exitoso
            setFormLogin({ email: '', password: '' });

            // Aquí podrías navegar a la pantalla principal del juego
            // navigation.navigate('GameScreen');

        } catch (error: any) {
            console.error('Error en el login:', error);
            
            // Manejar diferentes tipos de errores de Firebase
            let errorMessage = 'Error al iniciar sesión';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No existe una cuenta con este email. Regístrate primero.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Contraseña incorrecta. Verifica tus credenciales.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'El formato del email no es válido.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Esta cuenta ha sido deshabilitada.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Error de conexión. Verifica tu internet.';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'Usuario o contraseña incorrectos.';
                    break;
                default:
                    errorMessage = 'Error inesperado. Intenta nuevamente.';
            }
            
            showDialog('Error de Inicio de Sesión', errorMessage, 'error');
        } finally {
            // Desactivar loading
            setIsLoading(false);
        }
    }

    return (
        <View style={styles.root}>
            <Text>Iniciar Sesión</Text>
            <TextInput
                label="Email"
                placeholder='Escribe tu correo'
                onChangeText={(value) => handleSetValues('email', value)}
                style={styles.input}
                value={formLogin.email}
                disabled={isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                label="Contraseña"
                placeholder='Escribe tu contraseña'
                secureTextEntry
                onChangeText={(value) => handleSetValues('password', value)}
                style={styles.input}
                value={formLogin.password}
                disabled={isLoading}
                autoCapitalize="none"
            />
            <Button 
                mode="contained"
                onPress={handleLoginUser}
                style={styles.button}
                loading={isLoading}
                disabled={isLoading}
            >
                {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
            </Button>

            <Button 
                mode="outlined"
                onPress={() => navigation.navigate('Register' as never)}
                style={[styles.button, { marginTop: 10 }]}
                disabled={isLoading}
            >
                ¿No tienes cuenta? Regístrate
            </Button>

            {/* Diálogo dinámico */}
            <Portal>
                <Dialog visible={dialogState.visible} onDismiss={hideDialog}>
                    <Dialog.Title style={{ 
                        color: dialogState.type === 'error' ? '#d32f2f' : '#2e7d32' 
                    }}>
                        {dialogState.title}
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ 
                            color: dialogState.type === 'error' ? '#d32f2f' : '#2e7d32' 
                        }}>
                            {dialogState.message}
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button 
                            onPress={hideDialog}
                            textColor={dialogState.type === 'error' ? '#d32f2f' : '#2e7d32'}
                        >
                            {dialogState.type === 'error' ? 'Entendido' : 'Continuar'}
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    )
} 