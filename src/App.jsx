
import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    isLoading,
    error
  } = useAuth0();

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error.message}</p>;

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>AF - Sistema da Prova</h1>

      {!isAuthenticated ? (
        <button onClick={() => loginWithRedirect()}>
          Entrar com Auth0
        </button>
      ) : (
        <>
          <h2>Bem-vindo!</h2>
          <p>Nome: {user?.name}</p>
          <p>Email: {user?.email}</p>

          <button
            onClick={() =>
              logout({
                logoutParams: {
                  returnTo: window.location.origin
                }
              })
            }
          >
            Sair
          </button>
        </>
      )}
    </div>
  );
}

export default App;
