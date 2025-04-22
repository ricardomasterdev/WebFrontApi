// Função que carrega o relatório de livros mais locados
function carregarRelatorio() {
    const url = "http://app1.cdxsistemas.com.br:2222/api/Livros/mais-locados";
    const relatorioDiv = document.getElementById("relatorio-livros");
  
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error("Erro na resposta da rede");
        }
        return response.json();
      })
      .then(data => {
        let htmlContent = '<div class="table-responsive">';
        htmlContent += '<table class="table table-bordered">';
        htmlContent += '<thead><tr class="table-dark"><th>Livro</th><th>Quantidade</th></tr></thead>';
        htmlContent += '<tbody>';
        
        for (const livro in data) {
          if (data.hasOwnProperty(livro)) {
            htmlContent += `<tr><td>${livro}</td><td>${data[livro]}</td></tr>`;
          }
        }
        
        htmlContent += '</tbody></table></div>';
        relatorioDiv.innerHTML = htmlContent;
      })
      .catch(error => {
        console.error("Erro ao carregar o relatório:", error);
        relatorioDiv.innerHTML = '<div class="alert alert-danger" role="alert">Ocorreu um erro ao carregar os dados do relatório.</div>';
      });
  }
  
  // Se o conteúdo da página for carregado (no caso, via fetch) é recomendável também chamar a função
  document.addEventListener("DOMContentLoaded", function() {
    // Se a página carregada incluir o container do relatório, podemos chamar carregarRelatorio.
    if (document.getElementById("relatorio-livros")) {
      carregarRelatorio();
    }
  });
  