const loginApiUrl = "http://app1.cdxsistemas.com.br:2222/api/login"; // Ajuste esta URL conforme sua API

// Adiciona o listener para envio do formulário
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Coleta os dados dos inputs
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  
  const data = { email, senha };

  try {
    const response = await fetch(loginApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    // Verifica se a resposta não foi bem-sucedida
    if (!response.ok) {
      if (response.status === 401) {
        document.getElementById("msgErro").textContent = "Usuário ou senha incorretos.";
      } else if (response.status === 403) {
        document.getElementById("msgErro").textContent = "Acesso negado. Permissão insuficiente.";
      } else if (response.status === 404) {
        document.getElementById("msgErro").textContent = "Endpoint não encontrado.";
      } else {
        try {
          const errorData = await response.json();
          document.getElementById("msgErro").textContent = errorData.message || "Erro ao acessar o servidor.";
        } catch {
          document.getElementById("msgErro").textContent = "Erro ao conectar com o servidor.";
        }
      }
      return;
    }

    // Se o login for bem-sucedido, obtenha o token
    const result = await response.json();
    console.log("Login bem-sucedido:", result);

    // Armazena o token no localStorage
    localStorage.setItem("token", result.token);

    // Decodifica o token para extrair o payload
    const payloadBase64 = result.token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    // Extrai o role do payload e define o perfil
    // Consideramos que o role "Administrador" corresponde ao perfil 0 e qualquer outro valor será tratado como perfil 1 (Usuário Padrão)
    const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const perfil = role === "Administrador" ? 0 : 1;

    // Redireciona de acordo com o perfil
    if (perfil === 0) {
      window.location.href = "entrada.html"; // Acesso para Administrador
    } else {
      window.location.href = "entradap.html"; // Acesso para Usuário Padrão
    }

  } catch (error) {
    console.error("Erro ao fazer login:", error);
    document.getElementById("msgErro").textContent = "Erro de conexão. Verifique sua rede ou tente mais tarde.";
  }
});
