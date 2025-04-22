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

var usuarioId = getLoggedUserId();

document.addEventListener("DOMContentLoaded", () => {
  inicializarGraficoStatusLocacoes();
});

async function inicializarGraficoStatusLocacoes() {
  const canvas = document.getElementById('grafico-status-locacoes');
  if (!canvas) {
    console.warn("Canvas do gráfico não encontrado.");
    return;
  }

  // Faz a requisição à API de status de locações
  let status;
  try {
    const resposta = await fetch("http://app1.cdxsistemas.com.br:2222/api/Locacoes/status-quantidade/" + usuarioId);
    if (!resposta.ok) throw new Error("Erro ao buscar dados da API.");
    status = await resposta.json();
  } catch (err) {
    console.error("Erro ao carregar dados do gráfico:", err);
    return;
  }

  const ctx = canvas.getContext('2d');

  // Registra o plugin se disponível
  if (typeof ChartDataLabels !== "undefined") {
    Chart.register(ChartDataLabels);
  }

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [+ status.emAndamento+' Em Andamento ', + status.finalizadas+' Finalizadas', + status.canceladas+' Canceladas'],
      datasets: [{
        label: 'Locações',
        data: [
          status.emAndamento || 0,
          status.finalizadas || 0,
          status.canceladas || 0
        ],
        backgroundColor: [
          'rgba(236, 203, 126, 0.7)',
          'rgba(161, 215, 169, 0.7)',
          'rgba(235, 180, 180, 0.71)'
        ],
        borderColor: '#fff',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        datalabels: {
          color: '#111',
          font: {
            weight: 'bold',
            size: 14
          },
          formatter: value => value
        },
        tooltip: {
          callbacks: {
            label: context => `${context.label}: ${context.parsed} locações`
          }
        }
      }
    },
    plugins: typeof ChartDataLabels !== "undefined" ? [ChartDataLabels] : []
  });
}
