import React, { useState } from 'react'
import { View } from 'react-native'
import { Button, Dialog, Portal, Text, TextInput } from 'react-native-paper'
import { styles } from '../theme/styles';
import { auth } from '../config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

interface FormRegister {
    email: string;
    password: string;
}

interface DialogState {
    visible: boolean;
    title: string;
    message: string;
    type: 'error' | 'success';
}

export const RegisterScreen = () => {
    const navigation = useNavigation();
    const [formRegister, setFormRegister] = useState<FormRegister>({
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
        setFormRegister({... formRegister, [key]:value});
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

    const handleRegisterUser = async () => {
        // Validación de campos vacíos
        if (!formRegister.email || !formRegister.password) {
            showDialog('Error de Validación', 'Por favor, completa todos los campos', 'error');
            return;
        }

        // Validación de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formRegister.email)) {
            showDialog('Error de Validación', 'Por favor, ingresa un email válido', 'error');
            return;
        }

        // Validación de longitud de contraseña
        if (formRegister.password.length < 6) {
            showDialog('Error de Validación', 'La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        // Activar loading
        setIsLoading(true);

        try {
            // Crear usuario con Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formRegister.email,
                formRegister.password
            );

            // Usuario creado exitosamente
            const user = userCredential.user;
            console.log('Usuario registrado:', user.email);
            
            showDialog(
                '¡Registro Exitoso!', 
                `Bienvenido ${formRegister.email}. Tu cuenta ha sido creada correctamente.`, 
                'success'
            );
            
            // Limpiar el formulario después del registro exitoso
            setFormRegister({ email: '', password: '' });

        } catch (error: any) {
            console.error('Error en el registro:', error);
            
            // Manejar diferentes tipos de errores de Firebase
            let errorMessage = 'Error al registrar usuario';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Este email ya está registrado. Intenta con otro email.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'El formato del email no es válido.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'La contraseña es muy débil. Usa al menos 6 caracteres.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Error de conexión. Verifica tu internet.';
                    break;
                default:
                    errorMessage = 'Error inesperado. Intenta nuevamente.';
            }
            
            showDialog('Error de Registro', errorMessage, 'error');
        } finally {
            // Desactivar loading
            setIsLoading(false);
        }
    }

    return (
        <View style={styles.root}>
            <Text>Registro de Usuario</Text>
            <TextInput
                label="Email"
                placeholder='Escribe tu correo'
                onChangeText={(value) => handleSetValues('email', value)}
                style={styles.input}
                value={formRegister.email}
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
                value={formRegister.password}
                disabled={isLoading}
                autoCapitalize="none"
            />
            <Button 
                mode="contained"
                onPress={handleRegisterUser}
                style={styles.button}
                loading={isLoading}
                disabled={isLoading}
            >
                {isLoading ? 'Registrando...' : 'Registrarse'}
            </Button>

            <Button 
                mode="outlined"
                onPress={() => navigation.navigate('Login' as never)}
                style={[styles.button, { marginTop: 10 }]}
                disabled={isLoading}
            >
                ¿Ya tienes cuenta? Inicia Sesión
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
