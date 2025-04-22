const apiUrl = "http://app1.cdxsistemas.com.br:2222/api/Livros";

// Variáveis para paginação
let livrosData = [];
let currentPage = 1;
const itemsPerPage = 10;

// Função utilitária para montar os headers com o token JWT
function getAuthHeaders() {
  return {
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  };
}

document.addEventListener("DOMContentLoaded", carregarLivros);

async function carregarLivros() {
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: getAuthHeaders()
    });
    const livros = await response.json();
    console.log("Livros carregados:", JSON.stringify(livros, null, 2));
    livrosData = livros;    // Armazena os livros para paginação
    currentPage = 1;         // Reinicia para a primeira página
    renderPaginatedTable();  // Exibe a página atual com paginação
  } catch (error) {
    console.error("Erro ao carregar livros:", error);
  }
}

async function buscarLivros() {
  const termo = document.getElementById("filtro").value.trim();
  if (!termo) return carregarLivros();

  try {
    const response = await fetch(`${apiUrl}/pesquisar?termo=${encodeURIComponent(termo)}`, {
      method: "GET",
      headers: getAuthHeaders()
    });
    const livros = await response.json();
    console.log("Resultado da busca:", JSON.stringify(livros, null, 2));
    livrosData = livros;    // Armazena os livros encontrados
    currentPage = 1;         // Reinicia para a primeira página
    renderPaginatedTable();  // Exibe a página atual com paginação
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
  }
}

// Função que renderiza a tabela com base na página atual
function renderPaginatedTable() {
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedLivros = livrosData.slice(start, start + itemsPerPage);
  preencherTabela(paginatedLivros);
  updatePagination();
}

function preencherTabela(livros) {
  const tbody = document.getElementById("tabela-livros");
  tbody.innerHTML = "";

  livros.forEach(livro => {
    tbody.innerHTML += `
      <tr>
        <td>${livro.titulo}</td>
        <td>${livro.autor}</td>
        <td>${livro.editora}</td>
        <td>${livro.anoPublicacao}</td>
        <td>${livro.isbn}</td>
        <td>${livro.quantidadeDisponivel}</td>
        <td>${livro.valorLocacao ? livro.valorLocacao.toFixed(2) : "0.00"}</td>
        <td>${livro.diasLocacao !== undefined ? livro.diasLocacao : ""}</td>
        <td>${livro.percentualMulta !== undefined ? livro.percentualMulta.toFixed(2) + "%" : "0.00%"}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick='editarLivro(${JSON.stringify(livro)})'>Editar</button>
          <button class="btn btn-sm btn-danger" onclick="excluirLivro(${livro.id})">Excluir</button>
        </td>
      </tr>
    `;
  });
}

// Atualiza os controles de paginação
function updatePagination() {
  const totalItems = livrosData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  // Botão Anterior
  const prevLi = document.createElement("li");
  prevLi.className = "page-item" + (currentPage === 1 ? " disabled" : "");
  const prevLink = document.createElement("a");
  prevLink.className = "page-link";
  prevLink.href = "#";
  prevLink.textContent = "Anterior";
  prevLink.onclick = function(e) {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderPaginatedTable();
    }
  };
  prevLi.appendChild(prevLink);
  paginationContainer.appendChild(prevLi);

  // Números das páginas
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = "page-item" + (i === currentPage ? " active" : "");
    const link = document.createElement("a");
    link.className = "page-link";
    link.href = "#";
    link.textContent = i;
    link.onclick = function(e) {
      e.preventDefault();
      currentPage = i;
      renderPaginatedTable();
    };
    li.appendChild(link);
    paginationContainer.appendChild(li);
  }

  // Botão Próximo
  const nextLi = document.createElement("li");
  nextLi.className = "page-item" + (currentPage === totalPages ? " disabled" : "");
  const nextLink = document.createElement("a");
  nextLink.className = "page-link";
  nextLink.href = "#";
  nextLink.textContent = "Próximo";
  nextLink.onclick = function(e) {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      renderPaginatedTable();
    }
  };
  nextLi.appendChild(nextLink);
  paginationContainer.appendChild(nextLi);
}

function editarLivro(livro) {
  console.log("Editando livro:", JSON.stringify(livro, null, 2));
  document.getElementById("form-titulo").textContent = "Editar Livro";
  document.getElementById("livro-id").value = livro.id;
  document.getElementById("titulo").value = livro.titulo;
  document.getElementById("autor").value = livro.autor;
  document.getElementById("editora").value = livro.editora;
  document.getElementById("ano").value = livro.anoPublicacao;
  document.getElementById("isbn").value = livro.isbn;
  document.getElementById("quantidade").value = livro.quantidadeDisponivel;
  document.getElementById("valor-locacao").value = livro.valorLocacao;
  document.getElementById("dias-locacao").value = livro.diasLocacao;
  document.getElementById("percentual-multa").value = livro.percentualMulta;
}

function limparFormulario() {
  document.getElementById("form-titulo").textContent = "Cadastrar Livro";
  document.getElementById("livro-id").value = "";
  document.querySelector("form").reset();
}

async function salvarLivro(e) {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const autor = document.getElementById("autor").value.trim();
  const editora = document.getElementById("editora").value.trim();
  const ano = parseInt(document.getElementById("ano").value);
  const isbn = document.getElementById("isbn").value.trim();
  const quantidade = parseInt(document.getElementById("quantidade").value);
  const valorLocacao = parseFloat(document.getElementById("valor-locacao").value);
  const diasLocacao = parseInt(document.getElementById("dias-locacao").value);
  const percentualMulta = parseFloat(document.getElementById("percentual-multa").value);

  if (isNaN(valorLocacao) || isNaN(diasLocacao) || isNaN(percentualMulta)) {
    alert("Preencha os campos de Valor da Locação, Dias de Locação e Percentual de Multa corretamente.");
    return;
  }

  const idValue = document.getElementById("livro-id").value;
  const livro = {
    id: idValue ? parseInt(idValue) : null,
    titulo,
    autor,
    editora,
    anoPublicacao: ano,
    isbn,
    quantidadeDisponivel: quantidade,
    valorLocacao,
    diasLocacao,
    percentualMulta
  };

  console.log("Dados do livro a salvar:", JSON.stringify(livro, null, 2));

  try {
    const url = livro.id ? `${apiUrl}/${livro.id}` : apiUrl;
    const method = livro.id ? "PUT" : "POST";

    await fetch(url, {
      method: method,
      headers: getAuthHeaders(),
      body: JSON.stringify(livro)
    });

    limparFormulario();
    carregarLivros();
  } catch (error) {
    console.error("Erro ao salvar livro:", error);
  }
}

async function excluirLivro(id) {
  const confirmado = await showConfirmModal("Você realmente deseja excluir este livro?");
  if (!confirmado) return;

  try {
    await fetch(`${apiUrl}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    carregarLivros();
  } catch (error) {
    console.error("Erro ao excluir livro:", error);
  }
}

function showConfirmModal(message) {
  return new Promise((resolve) => {
    const modalDiv = document.createElement("div");
    modalDiv.className = "modal fade";
    modalDiv.tabIndex = -1;
    modalDiv.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar Exclusão</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">
            <p>${message || "Você realmente deseja excluir este livro?"}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" id="modalConfirmBtn">Excluir</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
    const modal = new bootstrap.Modal(modalDiv);
    modal.show();

    const btnConfirm = modalDiv.querySelector("#modalConfirmBtn");
    btnConfirm.addEventListener("click", () => {
      resolve(true);
      modal.hide();
    }, { once: true });

    modalDiv.addEventListener("hidden.bs.modal", () => {
      modalDiv.remove();
      resolve(false);
    }, { once: true });
  });
}
