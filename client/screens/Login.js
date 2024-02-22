import { useUser } from "../context/UserContext";

function Login() {
    const { user, setUser } = useUser();

    const onGoogleButtonPress = async () => {
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const { idToken } = await GoogleSignin.signIn();
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
            await auth().signInWithCredential(googleCredential);
        } catch (error) {
            console.log(error);
        }
    };

    // Se não houver usuário logado, mostra o botão de login
    if (!user) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <GoogleSigninButton onPress={onGoogleButtonPress} />
            </View>
        );
    }

    // Caso o usuário esteja logado, você pode redirecioná-lo ou retornar null
    return null; // Ou redirecionar para a tela principal da aplicação
}