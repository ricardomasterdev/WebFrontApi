function getUsuarioAutenticado() {
    const token = localStorage.getItem("token");
    if (!token) return null;
  
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
  
    try {
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
  
      // Extrai o nome direto do token
      const nome = payload.nome;
  
      // Extrai o papel (perfil) do campo 'role'
      const perfilString = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  
      // Converte texto para número: 0 = Administrador, 1 = Usuário
      let perfil = null;
      if (perfilString === "Administrador") perfil = 0;
      else if (perfilString === "Usuario") perfil = 1;
  
      return { nome, perfil };
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      return null;
    }
  }
  