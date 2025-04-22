document.addEventListener("DOMContentLoaded", function() {
    carregarRelatorioClientes();
});
  
function carregarRelatorioClientes() {
  const url = "http://app1.cdxsistemas.com.br:2222/api/Locacoes/clientes-mais-emprestimos";
  const relatorioDiv = document.getElementById("relatorio-clientes");
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        // Exibe o status no console para ajudar na depuração
        console.error("Status da resposta:", response.status);
        throw new Error("Erro na resposta da rede");
      }
      return response.json();
    })
    .then(data => {
      // Verifique no console se os dados estão corretos
      console.log("Dados recebidos:", data);
      
      // Monta a tabela usando classes do Bootstrap
      let htmlContent = '<div class="table-responsive">';
      htmlContent += '<table class="table table-bordered">';
      htmlContent += '<thead><tr class="table-dark"><th>Cliente</th><th>Quantidade de Empréstimos</th></tr></thead>';
      htmlContent += '<tbody>';
      
      for (const cliente in data) {
        if (data.hasOwnProperty(cliente)) {
          htmlContent += `<tr><td>${cliente}</td><td>${data[cliente]}</td></tr>`;
        }
      }
      
      htmlContent += '</tbody></table></div>';
      relatorioDiv.innerHTML = htmlContent;
    })
    .catch(error => {
      console.error("Erro ao carregar o relatório de clientes:", error);
      relatorioDiv.innerHTML = '<div class="alert alert-danger" role="alert">Ocorreu um erro ao carregar os dados do relatório.</div>';
    });
}
