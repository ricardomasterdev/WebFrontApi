// Função para decodificar um token JWT e retornar o payload
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64)
    .split('')
    .map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  return JSON.parse(jsonPayload);
}

// Função para exibir o identificador (propriedade "sub") do usuário logado no console
function showLoggedUserId() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("Usuário não está logado.");
    return;
  }
  try {
    const payload = parseJwt(token);
    if (payload.sub) {
      console.log("ID do usuário logado:", payload.sub);
    } else {
      console.log("ID do usuário não encontrado no token. Payload:", payload);
    }
  } catch (error) {
    console.error("Erro ao decodificar o token:", error);
  }
}

// Função para obter o id do usuário a partir do token (campo "sub")
function getLoggedUserId() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("Token não encontrado. Usuário não está logado.");
    return null;
  }
  try {
    const payload = parseJwt(token);
    return payload.sub; // 'sub' contém o id do usuário
  } catch (error) {
    console.error("Erro ao decodificar o token:", error);
    return null;
  }
}

showLoggedUserId();

// Define as URLs da API para usuários e livros
if (typeof usuarioApiUrl === "undefined") {
  var usuarioApiUrl = "http://app1.cdxsistemas.com.br:2222/api/usuarios";
}
if (typeof livroApiUrl === "undefined") {
  var livroApiUrl = "http://app1.cdxsistemas.com.br:2222/api/livros";
}

// Cria duas variáveis para locações:
// - locacoesUsuarioApiUrl: para listar e buscar as locações do usuário (com o id no endpoint)
// - locacoesBaseApiUrl: para operações (devolver, renovar, cancelar e salvar) usando o endpoint base.
var usuarioId = getLoggedUserId();
var locacoesUsuarioApiUrl = usuarioId 
  ? `http://app1.cdxsistemas.com.br:2222/api/locacoes/usuario/${usuarioId}`
  : "http://app1.cdxsistemas.com.br:2222/api/locacoes";
var locacoesBaseApiUrl = "http://app1.cdxsistemas.com.br:2222/api/locacoes";

function getAuthHeaders() {
  return {
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  };
}

// Função utilitária para formatar um objeto Date no formato YYYY-MM-DD
function getLocalDateString(date) {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  if (month < 10) { month = '0' + month; }
  if (day < 10) { day = '0' + day; }
  return `${year}-${month}-${day}`;
}

// Recalcula a data de devolução no modal de registro
function recalcDataDevolucao(modalPrefix) {
  const dataInput = document.getElementById(modalPrefix + "-dataLocacao");
  const diasInput = document.getElementById(modalPrefix + "-diasLocacao");
  const devolucaoInput = document.getElementById(modalPrefix + "-dataDevolucaoPrevista");
  let dataStr = dataInput.value;
  const dias = parseInt(diasInput.value);
  
  if (!dataStr) {
    dataStr = getLocalDateString(new Date());
    dataInput.value = dataStr;
  }
  
  if (dataStr && !isNaN(dias)) {
    const date = new Date(dataStr + "T00:00");
    date.setDate(date.getDate() + dias);
    devolucaoInput.value = getLocalDateString(date);
  }
}

// Função para limpar o formulário do modal de registro
// Removemos as referências aos campos de usuário, pois eles não existem mais
function limparFormulario(tipo) {
  if (tipo === "registrar") {
    document.getElementById("registrar-locacao-id").value = "";
    document.getElementById("registrar-livroId").value = "";
    document.getElementById("registrar-livroNome").value = "";
    document.getElementById("registrar-dataLocacao").value = "";
    document.getElementById("registrar-dataDevolucaoPrevista").value = "";
    document.getElementById("registrar-valorLocacao").value = "";
    document.getElementById("registrar-diasLocacao").value = "";
    document.getElementById("form-registrar-locacao").reset();
  }
}

// Variáveis para paginação de locações
let locacoesData = [];
let currentPageLocacoes = 1;
const itemsPerPageLocacoes = 10;

// Configura os eventos após o carregamento do DOM
function initLocacoes() {
  // Recarrega a lista de locações
  carregarLocacoes();

  const registrarDataInput = document.getElementById("registrar-dataLocacao");
  if (registrarDataInput) {
    const hoje = getLocalDateString(new Date());
    registrarDataInput.value = hoje;
    registrarDataInput.readOnly = true;
    registrarDataInput.addEventListener("change", () => recalcDataDevolucao("registrar"));
  }

  const modalRegistrar = document.getElementById("registrarLocacaoModal");
  if (modalRegistrar) {
    modalRegistrar.addEventListener("hidden.bs.modal", () => { limparFormulario("registrar"); });
    document.querySelectorAll("#registrarLocacaoModal button[data-bs-dismiss='modal']").forEach(btn => {
      btn.addEventListener("click", () => { limparFormulario("registrar"); });
    });
  }
}

if (document.readyState !== "loading") {
  initLocacoes();
} else {
  document.addEventListener("DOMContentLoaded", initLocacoes);
}

// Abre o modal de registro
function abrirModalRegistrar() {
  limparFormulario("registrar");
  const hoje = getLocalDateString(new Date());
  const dataInput = document.getElementById("registrar-dataLocacao");
  dataInput.value = hoje;
  dataInput.readOnly = true;
  document.getElementById("registrar-dataDevolucaoPrevista").value = "";
  document.getElementById("registrarLocacaoModalLabel").textContent = "Registrar Locação";
  const modalEl = document.getElementById("registrarLocacaoModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

// Função para carregar locações (usa o endpoint com o id do usuário)
async function carregarLocacoes() {
  try {
    const response = await fetch(locacoesUsuarioApiUrl, {
      method: "GET",
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Erro ao buscar locações");
    const locacoes = await response.json();
    locacoesData = locacoes;
    currentPageLocacoes = 1;
    renderPaginatedTableLocacoes();
  } catch (error) {
    console.error("Erro ao carregar locações:", error);
  }
}

// Função de busca com suporte para os filtros: usuário, livro ou status (usa o endpoint com o id do usuário)
async function buscarLocacoes() {
  const filtroTipo = document.getElementById("filtro-tipo").value;
  let termo = document.getElementById("filtro-locacao").value.trim();
  if (!termo) return carregarLocacoes();
  
  let param = "";
  if (filtroTipo === "usuario") {
    param = "nomeUsuario";
  } else if (filtroTipo === "livro") {
    param = "nomeLivro";
  } else if (filtroTipo === "status") {
    const statusMap = {
      "em andamento": 0,
      "finalizada": 1,
      "cancelada": 2,
      "cancelado": 2
    };
    termo = termo.toLowerCase();
    if (statusMap[termo] === undefined) {
      console.error("Status inválido. Utilize: Em Andamento, Finalizada ou Cancelada");
      return;
    }
    termo = statusMap[termo];
    param = "status";
  }

  try {
    const url = `${locacoesUsuarioApiUrl}/buscar?${param}=${encodeURIComponent(termo)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Erro ao buscar locações");
    const locacoes = await response.json();
    locacoesData = locacoes;
    currentPageLocacoes = 1;
    renderPaginatedTableLocacoes();
  } catch (error) {
    console.error("Erro ao buscar locações:", error);
  }
}

// Renderiza a tabela de locações com base na página atual
function renderPaginatedTableLocacoes() {
  const start = (currentPageLocacoes - 1) * itemsPerPageLocacoes;
  const paginatedLocacoes = locacoesData.slice(start, start + itemsPerPageLocacoes);
  preencherTabelaLocacoes(paginatedLocacoes);
  updatePaginationLocacoes();
}

// Atualiza os controles de paginação
function updatePaginationLocacoes() {
  const totalItems = locacoesData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPageLocacoes);
  const paginationContainer = document.getElementById("pagination-locacoes");
  paginationContainer.innerHTML = "";

  const prevLi = document.createElement("li");
  prevLi.className = "page-item" + (currentPageLocacoes === 1 ? " disabled" : "");
  const prevLink = document.createElement("a");
  prevLink.className = "page-link";
  prevLink.href = "#";
  prevLink.textContent = "Anterior";
  prevLink.onclick = function(e) {
    e.preventDefault();
    if (currentPageLocacoes > 1) {
      currentPageLocacoes--;
      renderPaginatedTableLocacoes();
    }
  };
  prevLi.appendChild(prevLink);
  paginationContainer.appendChild(prevLi);

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = "page-item" + (i === currentPageLocacoes ? " active" : "");
    const link = document.createElement("a");
    link.className = "page-link";
    link.href = "#";
    link.textContent = i;
    link.onclick = function(e) {
      e.preventDefault();
      currentPageLocacoes = i;
      renderPaginatedTableLocacoes();
    };
    li.appendChild(link);
    paginationContainer.appendChild(li);
  }

  const nextLi = document.createElement("li");
  nextLi.className = "page-item" + (currentPageLocacoes === totalPages ? " disabled" : "");
  const nextLink = document.createElement("a");
  nextLink.className = "page-link";
  nextLink.href = "#";
  nextLink.textContent = "Próximo";
  nextLink.onclick = function(e) {
    e.preventDefault();
    if (currentPageLocacoes < totalPages) {
      currentPageLocacoes++;
      renderPaginatedTableLocacoes();
    }
  };
  nextLi.appendChild(nextLink);
  paginationContainer.appendChild(nextLi);
}

function preencherTabelaLocacoes(locacoes) {
  const tbody = document.getElementById("tabela-locacoes");
  tbody.innerHTML = "";
  locacoes.forEach(locacao => {
    const acoes = (locacao.status === 0)
      ? `<button class="btn btn-sm btn-secondary me-1" onclick="abrirModalRenovar(${locacao.id})">Renovar</button>`
      : "";
    tbody.innerHTML += `<tr>
      <td>${locacao.id}</td>
      <td>${locacao.tituloLivro ? locacao.tituloLivro : "N/A"}</td>
      <td>${new Date(locacao.dataLocacao).toLocaleDateString()}</td>
      <td>${new Date(locacao.dataDevolucaoPrevista).toLocaleDateString()}</td>
      <td>${locacao.dataDevolucaoReal ? new Date(locacao.dataDevolucaoReal).toLocaleDateString() : ""}</td>
      <td>${locacao.valorLocacao !== undefined ? locacao.valorLocacao.toFixed(2) : "0.00"}</td>
      <td>${locacao.multa !== undefined && locacao.multa !== null ? locacao.multa.toFixed(2) : "0.00"}</td>
      <td>${locacao.valorRecebido !== undefined && locacao.valorRecebido !== null ? locacao.valorRecebido.toFixed(2) : "0.00"}</td>
      <td>${getStatusTexto(locacao.status)}</td>
      <td>${acoes}</td>
    </tr>`;
  });
}

function getStatusTexto(status) {
  switch(status) {
    case 0: return "Em Andamento";
    case 1: return "Finalizada";
    case 2: return "Cancelada";
    default: return "";
  }
}

// Função para salvar uma nova locação (usa o endpoint base)
// Aqui, removemos a leitura dos campos de usuário e usamos getLoggedUserId()
async function salvarLocacao(e, tipo) {
  e.preventDefault();
  if (tipo !== "registrar") return;
  
  const locacao = {
    livroId: parseInt(document.getElementById("registrar-livroId").value),
    usuarioId: parseInt(getLoggedUserId()), // Usa o ID do usuário logado
    dataLocacao: document.getElementById("registrar-dataLocacao").value,
    dataDevolucaoPrevista: document.getElementById("registrar-dataDevolucaoPrevista").value,
    valorLocacao: parseFloat(document.getElementById("registrar-valorLocacao").value),
    multa: 0,
    valorRecebido: 0,
    status: 0
  };

  // Mostra o JSON no console para debug
  console.log("Objeto Locação a ser gravado:", JSON.stringify(locacao, null, 2));

  const id = document.getElementById("registrar-locacao-id").value;
  try {
    if (id) {
      locacao.id = parseInt(id);
      await fetch(`${locacoesBaseApiUrl}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(locacao)
      });
    } else {
      await fetch(locacoesBaseApiUrl, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(locacao)
      });
    }
    const modalEl = document.getElementById("registrarLocacaoModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
    limparFormulario("registrar");
    carregarLocacoes();
  } catch (error) {
    console.error("Erro ao salvar locação:", error);
  }
}

// Abre o modal de devolução (usa o endpoint base)
async function abrirModalDevolver(id) {
  try {
    const response = await fetch(`${locacoesBaseApiUrl}/${id}`, {
      method: "GET",
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Erro ao buscar dados da locação");
    const locacao = await response.json();
    
    const valorLocacao = parseFloat(locacao.valorLocacao);
    const multa = locacao.multa ? parseFloat(locacao.multa) : 0;
    const total = (valorLocacao + multa).toFixed(2);
    
    document.getElementById("devolver-locacao-id").value = id;
    const mensagem = `Devolução de locação do Usuário: ${locacao.nomeUsuario} do Livro: ${locacao.tituloLivro} com valor total de R$ ${total} (Valor locação R$ ${valorLocacao.toFixed(2)} + Multas R$ ${multa.toFixed(2)}). Deseja confirmar?`;
    document.getElementById("devolverConfirmModalMessage").textContent = mensagem;
    
    const modalEl = new bootstrap.Modal(document.getElementById("devolverConfirmModal"));
    modalEl.show();
  } catch (error) {
    console.error("Erro ao abrir modal de devolução:", error);
  }
}

// Realiza a devolução (usa o endpoint base)
async function devolverLocacaoConfirma() {
  const id = document.getElementById("devolver-locacao-id").value;
  const payload = { id: parseInt(id, 10) };
  
  try {
    await fetch(`${locacoesBaseApiUrl}/devolver`, { 
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    carregarLocacoes();
  } catch (error) {
    console.error("Erro ao devolver locação:", error);
  }
}

// Abre o modal de renovação (usa o endpoint base)
async function abrirModalRenovar(id) {
  try {
    const response = await fetch(`${locacoesBaseApiUrl}/${id}`, {
      method: "GET",
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Erro ao buscar dados da locação");
    const locacao = await response.json();
    
    const valorAtual = parseFloat(locacao.valorLocacao);
    const novaCobranca = (valorAtual * 2).toFixed(2);
    
    document.getElementById("renovar-locacao-id").value = id;
    const mensagem = `A renovação da locação do Usuário: ${locacao.nomeUsuario} do Livro: ${locacao.tituloLivro} será realizada com a nova cobrança de R$ ${novaCobranca} (valor atual R$ ${valorAtual.toFixed(2)} + valor da locação original R$ ${valorAtual.toFixed(2)}) + Multas por atraso se houver. Deseja confirmar?`;
    document.getElementById("renovarConfirmModalMessage").textContent = mensagem;
    
    const modalEl = new bootstrap.Modal(document.getElementById("renovarConfirmModal"));
    modalEl.show();
  } catch (error) {
    console.error("Erro ao abrir modal de renovação:", error);
  }
}

// Realiza a renovação (usa o endpoint base)
async function renovarLocacaoConfirma() {
  const id = document.getElementById("renovar-locacao-id").value;
  const payload = { id: parseInt(id, 10) };
  
  try {
    await fetch(`${locacoesBaseApiUrl}/renovar`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    carregarLocacoes();
  } catch (error) {
    console.error("Erro ao renovar locação:", error);
  }
}

// Cancela a locação (usa o endpoint base)
async function cancelarLocacao(id) {
  const confirmado = await showConfirmModal("Deseja realmente cancelar a locação?");
  if (!confirmado) {
    console.log("Cancelamento abortado pelo usuário.");
    return;
  }
  try {
    const payload = { id: id, status: 2 };
    await fetch(`${locacoesBaseApiUrl}/cancelar`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    carregarLocacoes();
  } catch (error) {
    console.error("Erro ao cancelar locação:", error);
  }
}

// Autocomplete para o Modal de Registro (para livros)
let debounceTimerRegistrar;
document.getElementById("registrar-livroNome").addEventListener("input", function () {
  clearTimeout(debounceTimerRegistrar);
  const termo = this.value;
  if (termo.length < 2) return esconderLista("autocompleteLivros");
  debounceTimerRegistrar = setTimeout(() => {
    fetch(`${livroApiUrl}/pesquisar?termo=${encodeURIComponent(termo)}`, {
      method: "GET",
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(livros => {
        const lista = document.getElementById("autocompleteLivros");
        lista.innerHTML = "";
        livros.forEach(livro => {
          const li = document.createElement("li");
          li.className = "list-group-item list-group-item-action";
          const prazo = livro.diasLocacao !== undefined ? livro.diasLocacao : "N/A";
          if (Number(livro.quantidadeDisponivel) === 0) {
            li.textContent = `${livro.titulo} (ISBN: ${livro.isbn || "N/A"}) - *SEM ESTOQUE* - Valor: R$ ${livro.valorLocacao} - Prazo: ${prazo} dias`;
            li.classList.add("disabled");
            li.style.cursor = "not-allowed";
          } else {
            li.textContent = `${livro.titulo} (ISBN: ${livro.isbn || "N/A"}) - Disponível: ${livro.quantidadeDisponivel} - Valor: R$ ${livro.valorLocacao} - Prazo: ${prazo} dias`;
            li.onclick = () => {
              document.getElementById("registrar-livroId").value = livro.id;
              document.getElementById("registrar-livroNome").value = livro.titulo;
              document.getElementById("registrar-valorLocacao").value = livro.valorLocacao;
              document.getElementById("registrar-diasLocacao").value = livro.diasLocacao;
              recalcDataDevolucao("registrar");
              esconderLista("autocompleteLivros");
            };
          }
          lista.appendChild(li);
        });
        lista.style.display = livros.length ? "block" : "none";
      });
  }, 300);
});

// Removido o bloco de autocomplete para usuário, pois a escolha do usuário foi removida.

function esconderLista(id) {
  const lista = document.getElementById(id);
  lista.innerHTML = "";
  lista.style.display = "none";
}

document.addEventListener("click", (e) => {
  if (!e.target.closest("#registrar-livroNome")) esconderLista("autocompleteLivros");
  // Não há campo de usuário para monitorar
});

function showConfirmModal(message) {
  return new Promise((resolve) => {
    const modalElement = document.getElementById("confirmModalLocacao");
    const modal = new bootstrap.Modal(modalElement);
    document.getElementById("confirmModalLocacaoMessage").textContent = message || "Você realmente deseja realizar esta ação?";
    const btnConfirm = document.getElementById("modalLocacaoConfirmBtn");
    btnConfirm.onclick = () => {
      resolve(true);
      modal.hide();
    };
    modalElement.addEventListener("hidden.bs.modal", function onHide() {
      resolve(false);
      modalElement.removeEventListener("hidden.bs.modal", onHide);
    }, { once: true });
    modal.show();
  });
}

document.getElementById("confirmRenovarBtn").addEventListener("click", async () => {
  await renovarLocacaoConfirma();
  const modalEl = document.getElementById("renovarConfirmModal");
  const modal = bootstrap.Modal.getInstance(modalEl);
  modal.hide();
});

// Se o documento já estiver carregado, chama initLocacoes; caso contrário, espera o DOMContentLoaded.
if (document.readyState !== "loading") {
  initLocacoes();
} else {
  document.addEventListener("DOMContentLoaded", initLocacoes);
}
