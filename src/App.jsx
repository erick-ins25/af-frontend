import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const API = import.meta.env.VITE_API_BASE || '/api';

function App() {
  const { isLoading, isAuthenticated, user, error: authError, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0();
  const [tarefas, setTarefas] = useState([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [form, setForm] = useState({ emailCriador: '', titulo: '', descricao: '', prioridade: ''});

  async function token() {
    return getAccessTokenSilently({ authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE } });
  }

  function decodePayload(jwt) {
    try {
      const payload = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payload));
    } catch { return {}; }
  }

  async function carregar() {
    setCarregando(true); setErro('');
    try {
      const accessToken = await token();
      const payload = decodePayload(accessToken);
      setPermissoes(Array.isArray(payload.permissions) ? payload.permissions : []);
      const resposta = await fetch(`${API}/tarefa`, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!resposta.ok) throw new Error(`Falha ao listar tarefas (HTTP ${resposta.status})`);
      setTarefas(await resposta.json());
    } catch (e) { setErro(e.message); }
    finally { setCarregando(false); }
  }

  useEffect(() => { if (isAuthenticated) carregar(); else { setTarefas([]); } }, [isAuthenticated]);

  async function cadastrar(e) {
    e.preventDefault(); setErro(''); setSucesso(''); setCarregando(true);
    try {
      const accessToken = await token();
      const resposta = await fetch(`${API}/tarefa`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, nota: Number(form.nota) })
      });
      if (!resposta.ok) throw new Error(`Falha ao cadastrar (HTTP ${resposta.status})`);
      setSucesso('Tarefa cadastrada!');
      setForm({ emailCriador: '', titulo: '', descricao: '', prioridade: ''});
      await carregar();
    } catch (e) { setErro(e.message); }
    finally { setCarregando(false); }
  }

  if (isLoading) return <main className="container">Carregando autenticação...</main>;
  if (authError) return <main className="container">Erro Auth0: {authError.message}</main>;
  return <main className="container">
    <header><div><small>SISTEMA DE TAREFAS</small><h1>Tarefa+</h1></div>
      {isAuthenticated ? <button className="secondary" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Sair</button> : null}
    </header>
    {!isAuthenticated ? <section className="panel center"><h2>Entre para acessar as tarefas</h2><p>Autenticação segura pelo Auth0.</p><button onClick={() => loginWithRedirect()}>Entrar com Auth0</button></section> : <>
      <p>Conectado como <strong>{user?.email || user?.name}</strong></p>
      {erro && <p className="error" role="alert">{erro}</p>}
      {sucesso && <p className="success" role="status">{sucesso}</p>}
      <section className="panel"><div className="heading"><h2>Tarefas</h2><button className="secondary" onClick={carregar} disabled={carregando}>Atualizar</button></div>
        {carregando && <p>Carregando...</p>}
        {!carregando && tarefas.length === 0 && <p>Nenhuma tarefa encontrada.</p>}
        <div className="cards">{tarefas.map(a => <article key={a.id} className="card"><div className="heading"><strong>{a.emailCriador}</strong><span className="titulo">{a.titulo}</span></div><p>{a.descricao || 'Sem descrição'}</p><p>{a.prioridade || 'Sem prioridade'}</p></article>)}</div>
      </section>
      <section className="panel"><h2>Nova tarefa</h2>
      <form onSubmit={cadastrar}>
        <label>Título<textarea value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })}/></label>
        <label>Descrição<textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })}/></label>
        <label>Prioridade<textarea value={form.prioridade} onChange={e => setForm({ ...form, prioridade: e.target.value })}/></label>
        <button disabled={carregando}>Cadastrar tarefa</button>
      </form></section>
      
    </>}
  </main>;
}
export default App;
