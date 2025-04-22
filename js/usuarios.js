// URL da API para usuários
if (typeof usuarioApiUrl === "undefined") {
  var usuarioApiUrl = "http://app1.cdxsistemas.com.br:2222/api/usuarios";
}

console.log("✅ usuarios.js carregado");

// Utilitário para headers com token JWT
function getAuthHeaders() {
  return {
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  };
}

// Variáveis para paginação dos usuários
let usuariosData = [];
let currentPageUsuarios = 1;
const itemsPerPageUsuarios = 10;

// Função para carregar todos os usuários com paginação
async function carregarUsuarios() {
  try {
    const response = await fetch(usuarioApiUrl, {
      method: "GET",
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error("Erro ao buscar usuários");
    const usuarios = await response.json();
    usuariosData = usuarios;           // Armazena os dados para paginação
    currentPageUsuarios = 1;           // Reinicia para a primeira página
    renderPaginatedTableUsuarios();    // Renderiza a tabela paginada
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
  }
}

// Função para buscar usuários por termo com paginação
async function buscarUsuarios() {
  const termo = document.getElementById("filtro-usuario").value.trim();
  if (!termo) return carregarUsuarios();

  try {
    const response = await fetch(`${usuarioApiUrl}/buscar?nome=${encodeURIComponent(termo)}`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error("Erro ao buscar usuários");
    const usuarios = await response.json();
    usuariosData = usuarios;          // Armazena os dados para paginação
    currentPageUsuarios = 1;          // Reinicia para a primeira página
    renderPaginatedTableUsuarios();   // Renderiza a tabela paginada
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
  }
}

// Renderiza a tabela de usuários de acordo com a página atual
function renderPaginatedTableUsuarios() {
  const start = (currentPageUsuarios - 1) * itemsPerPageUsuarios;
  const paginatedUsuarios = usuariosData.slice(start, start + itemsPerPageUsuarios);
  preencherTabelaUsuarios(paginatedUsuarios);
  updatePaginationUsuarios();
}

// Atualiza os controles de paginação para os usuários
function updatePaginationUsuarios() {
  // Presume que há um elemento com id "pagination-usuarios" no HTML;
  // caso não exista, cria e insere após a tabela.
  let paginationContainer = document.getElementById("pagination-usuarios");
  if (!paginationContainer) {
    paginationContainer = document.createElement("nav");
    const ul = document.createElement("ul");
    ul.className = "pagination justify-content-center";
    ul.id = "pagination-usuarios";
    paginationContainer.appendChild(ul);
    // Insere o container após o elemento da tabela
    const tabela = document.getElementById("tabela-usuarios");
    tabela.parentNode.parentNode.appendChild(paginationContainer);
    paginationContainer = ul;
  } else {
    if (paginationContainer.tagName !== "UL") {
      // Se o container for o <ul>, limpa seu conteúdo
      paginationContainer = paginationContainer.querySelector("ul");
    }
    paginationContainer.innerHTML = "";
  }

  const totalItems = usuariosData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPageUsuarios);

  // Botão "Anterior"
  const prevLi = document.createElement("li");
  prevLi.className = "page-item" + (currentPageUsuarios === 1 ? " disabled" : "");
  const prevLink = document.createElement("a");
  prevLink.className = "page-link";
  prevLink.href = "#";
  prevLink.textContent = "Anterior";
  prevLink.onclick = function(e) {
    e.preventDefault();
    if (currentPageUsuarios > 1) {
      currentPageUsuarios--;
      renderPaginatedTableUsuarios();
    }
  };
  prevLi.appendChild(prevLink);
  paginationContainer.appendChild(prevLi);

  // Números das páginas
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = "page-item" + (i === currentPageUsuarios ? " active" : "");
    const link = document.createElement("a");
    link.className = "page-link";
    link.href = "#";
    link.textContent = i;
    link.onclick = function(e) {
      e.preventDefault();
      currentPageUsuarios = i;
      renderPaginatedTableUsuarios();
    };
    li.appendChild(link);
    paginationContainer.appendChild(li);
  }

  // Botão "Próximo"
  const nextLi = document.createElement("li");
  nextLi.className = "page-item" + (currentPageUsuarios === totalPages ? " disabled" : "");
  const nextLink = document.createElement("a");
  nextLink.className = "page-link";
  nextLink.href = "#";
  nextLink.textContent = "Próximo";
  nextLink.onclick = function(e) {
    e.preventDefault();
    if (currentPageUsuarios < totalPages) {
      currentPageUsuarios++;
      renderPaginatedTableUsuarios();
    }
  };
  nextLi.appendChild(nextLink);
  paginationContainer.appendChild(nextLi);
}

// Converte perfil numérico em texto
function converterPerfil(perfil) {
  if (perfil === 0 || perfil === "0") return "Administrador";
  if (perfil === 1 || perfil === "1") return "Usuário Padrão";
  return perfil;
}

// Preenche a tabela com os usuários (passados como parâmetro)
function preencherTabelaUsuarios(usuarios) {
  const tbody = document.getElementById("tabela-usuarios");
  tbody.innerHTML = "";

  usuarios.forEach(usuario => {
    const perfilTexto = converterPerfil(usuario.perfil);
    tbody.innerHTML += `
      <tr>
        <td>${usuario.nome}</td>
        <td>${usuario.email}</td>
        <td>${usuario.telefone}</td>
        <td>${perfilTexto}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick='editarUsuario(${JSON.stringify(usuario)})'>Editar</button>
          <button class="btn btn-sm btn-danger" onclick="excluirUsuario(${usuario.id})">Excluir</button>
        </td>
      </tr>
    `;
  });
}

// Preenche o formulário ao editar
function editarUsuario(usuario) {
  document.getElementById("form-titulo-usuario").textContent = "Editar Usuário";
  document.getElementById("usuario-id").value = usuario.id;
  document.getElementById("nome").value = usuario.nome;
  document.getElementById("email").value = usuario.email;
  document.getElementById("telefone").value = usuario.telefone;
  document.getElementById("perfil").value = usuario.perfil.toString();
}

// Limpa o formulário
function limparFormularioUsuario() {
  document.getElementById("form-titulo-usuario").textContent = "Cadastrar Usuário";
  document.getElementById("usuario-id").value = "";
  document.querySelector("form").reset();
  document.getElementById("perfil").value = "";
}

// Cria ou atualiza um usuário
async function salvarUsuario(e) {
  e.preventDefault();

  const usuario = {
    nome: document.getElementById("nome").value.trim(),
    email: document.getElementById("email").value.trim(),
    telefone: document.getElementById("telefone").value.trim(),
    perfil: parseInt(document.getElementById("perfil").value),
    senha: document.getElementById("senha").value.trim()
  };

  const id = document.getElementById("usuario-id").value;
  const url = id ? `${usuarioApiUrl}/${id}` : usuarioApiUrl;
  const method = id ? "PUT" : "POST";

  if (id) usuario.id = parseInt(id);

  try {
    await fetch(url, {
      method: method,
      headers: getAuthHeaders(),
      body: JSON.stringify(usuario)
    });

    limparFormularioUsuario();
    carregarUsuarios();
  } catch (error) {
    console.error("Erro ao salvar usuário:", error);
  }
}

// Exclui um usuário
async function excluirUsuario(id) {
  if (!confirm("Deseja excluir este usuário?")) return;

  try {
    await fetch(`${usuarioApiUrl}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    carregarUsuarios();
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
  }
}

// Carrega os usuários ao abrir a página
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", carregarUsuarios);
} else {
  carregarUsuarios();
}
